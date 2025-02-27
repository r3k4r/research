import { PrismaClient } from "@prisma/client"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { sendVerificationCode } from "./email"
import { CustomPrismaAdapter } from "./customPrismaAdapter"

const prisma = new PrismaClient()

export const authOptions = {
  // Replace PrismaAdapter with our custom adapter
  adapter: CustomPrismaAdapter(prisma),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        // Find user with their profile
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { 
            profile: true,
            providerProfile: true 
          }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        if (!user.emailVerified) {
          const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              emailVerificationToken: verificationCode,
              emailVerificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            }
          })

          await sendVerificationCode(user.email, verificationCode, 'email')
          throw new Error("EmailNotVerified")
        }

        if (user.twoFactorEnabled) {
          if (!credentials.twoFactorCode) {
            const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString()
            await prisma.user.update({
              where: { id: user.id },
              data: {
                twoFactorCode,
                twoFactorCodeExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
              }
            })

            await sendVerificationCode(user.email, twoFactorCode, '2fa')
            throw new Error("TwoFactorRequired")
          }

          if (user.twoFactorCode !== credentials.twoFactorCode || user.twoFactorCodeExpires < new Date()) {
            throw new Error("Invalid 2FA code")
          }

          await prisma.user.update({
            where: { id: user.id },
            data: {
              twoFactorCode: null,
              twoFactorCodeExpires: null,
            }
          })
        }

       
        let userWithProfile = { ...user };
        
        if (user.profile) {
          userWithProfile.name = user.profile.name;
          userWithProfile.image = user.profile.image;
        } else if (user.providerProfile) {
          userWithProfile.name = user.providerProfile.businessName;
          userWithProfile.image = user.providerProfile.logo;
        }

        return userWithProfile;
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // If we have user data (first authentication)
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
        token.twoFactorEnabled = user.twoFactorEnabled;
        
        // Try to get profile data directly from user object if available
        if (user.name) token.name = user.name;
        if (user.image) token.image = user.image;
      }
      
      // Always fetch fresh profile data on every token refresh
      try {
        const userData = await prisma.user.findUnique({
          where: { id: token.id || user?.id },
          include: { 
            profile: true,
            providerProfile: true 
          }
        });
        
        if (userData) {
          // Use profile data based on user role
          if (userData.role === 'PROVIDER' && userData.providerProfile) {
            token.name = userData.providerProfile.businessName;
            token.image = userData.providerProfile.logo;
          } else if (userData.profile) {
            token.name = userData.profile.name;
            token.image = userData.profile.image;
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
      
      // Google sign-in email verification
      if (account && account.provider === 'google') {
        token.emailVerified = new Date();
        await prisma.user.update({
          where: { email: token.email },
          data: { emailVerified: new Date() }
        });
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          role: token.role,
          emailVerified: token.emailVerified,
          twoFactorEnabled: token.twoFactorEnabled,
          // Explicitly include name and image from token
          name: token.name,
          image: token.image
        }
        
        // Add profile type
        if (token.role === 'PROVIDER') {
          session.user.profileType = 'provider';
        } else {
          session.user.profileType = 'user';
        }
      }
      return session;
    },
    
    async signIn({ user, account, profile }) {
      // Only for Google sign-in
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { profile: true }
          });
          
          if (existingUser && !existingUser.profile) {
            // Create profile for Google user if none exists
            await prisma.userProfile.create({
              data: {
                userId: existingUser.id,
                name: profile.name || (profile.given_name && profile.family_name 
                  ? `${profile.given_name} ${profile.family_name}` 
                  : existingUser.email.split('@')[0]),
                image: profile.picture
              }
            });
          }
        } catch (error) {
          console.error("Error in Google sign-in:", error);
        }
      }
      return true;
    }
  },
  
  pages: {
    signIn: '/signin',
    verifyRequest: '/verify-email',
    error: '/auth/error',
  },
  
  session: {
    strategy: "jwt",
  },
  
  secret: process.env.NEXTAUTH_SECRET,
}

