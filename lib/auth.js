import { PrismaClient } from "@prisma/client"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { sendVerificationCode } from "./email"
import { CustomPrismaAdapter } from "./customPrismaAdapter"

// ===============================================
// NEXTAUTH CONFIGURATION
// ===============================================
// This file configures the entire authentication system for the app.
// It handles logins, sign-ups, sessions, and user profiles.

const prisma = new PrismaClient()

export const authOptions = {
  adapter: CustomPrismaAdapter(prisma),
  
  // ===============================================
  // AUTH PROVIDERS
  // ===============================================
  providers: [
    // 1. Google OAuth - "Sign in with Google"
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    // 2. Email/Password - Traditional login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" },
      },
      
      // ===============================================
      // LOGIN AUTHORIZATION FUNCTION
      // ===============================================
      async authorize(credentials) {
        // Basic validation
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        // Find the user with their profile data and verification data
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { 
            profile: true,
            providerProfile: true,
            emailVerification: true,
            twoFactorAuth: true
          }
        })

        // Check if user exists
        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        // ===============================================
        // EMAIL VERIFICATION CHECK
        // ===============================================
        if (!user.emailVerified) {
          // Generate verification code if needed
          const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
          const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          
          if (user.emailVerification) {
            // Update existing verification record if expired
            if (user.emailVerification.expires < new Date()) {
              await prisma.emailVerification.update({
                where: { id: user.emailVerification.id },
                data: {
                  token: verificationCode,
                  expires: tokenExpiry
                }
              })
              await sendVerificationCode(user.email, verificationCode, 'email')
            } else {
              // Use existing code if still valid
              await sendVerificationCode(user.email, user.emailVerification.token, 'email')
            }
          } else {
            // Create new verification record if none exists
            await prisma.emailVerification.create({
              data: {
                userId: user.id,
                token: verificationCode,
                expires: tokenExpiry
              }
            })
            await sendVerificationCode(user.email, verificationCode, 'email')
          }
          
          throw new Error("EmailNotVerified")
        }

        // ===============================================
        // TWO-FACTOR AUTHENTICATION (2FA)
        // ===============================================
        if (user.twoFactorEnabled) {
          // If no 2FA code provided yet, send one
          if (!credentials.twoFactorCode) {
            const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString()
            const codeExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
            
            // Delete any existing codes
            if (user.twoFactorAuth) {
              await prisma.twoFactorAuth.delete({
                where: { id: user.twoFactorAuth.id }
              })
            }
            
            // Create new code
            await prisma.twoFactorAuth.create({
              data: {
                userId: user.id,
                code: twoFactorCode,
                expires: codeExpiry
              }
            })

            // Send code via email
            await sendVerificationCode(user.email, twoFactorCode, '2fa')
            throw new Error("TwoFactorRequired")
          }

          // Verify the provided 2FA code
          const validCode = user.twoFactorAuth && 
                          user.twoFactorAuth.code === credentials.twoFactorCode && 
                          user.twoFactorAuth.expires > new Date();
          
          if (!validCode) {
            throw new Error("Invalid 2FA code")
          }

          // Delete the used 2FA code
          if (user.twoFactorAuth) {
            await prisma.twoFactorAuth.delete({
              where: { id: user.twoFactorAuth.id }
            })
          }
        }

        // ===============================================
        // ADD PROFILE DATA TO USER OBJECT
        // ===============================================
        let userWithProfile = { 
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled
        };
        
        // Add name and image from appropriate profile
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
  
  // ===============================================
  // CALLBACKS
  // ===============================================
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // If we have user data (on first login), add it to the token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
        token.twoFactorEnabled = user.twoFactorEnabled;
        
        // Add name and image if available
        if (user.name) token.name = user.name;
        if (user.image) token.image = user.image;
      }
      
      // ===============================================
      // FETCH FRESH PROFILE DATA
      // ===============================================
      try {
        const userData = await prisma.user.findUnique({
          where: { id: token.id || user?.id },
          include: { 
            profile: true,
            providerProfile: true 
          }
        });
        
        if (userData) {
          // Pick profile data based on user type
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
      
      // ===============================================
      // GOOGLE SIGN-IN EMAIL VERIFICATION
      // ===============================================
      if (account && account.provider === 'google') {
        token.emailVerified = new Date();
        await prisma.user.update({
          where: { email: token.email },
          data: { emailVerified: new Date() }
        });
      }
      
      return token;
    },
    
    // ===============================================
    // SESSION CALLBACK
    // ===============================================
    async session({ session, token }) {
      if (token) {
        // Add user data from token to the session
        session.user = {
          ...session.user,
          id: token.id,
          role: token.role,
          emailVerified: token.emailVerified,
          twoFactorEnabled: token.twoFactorEnabled,
          name: token.name,
          image: token.image
        }
        
        // Add a convenient profileType field for UI decisions
        if (token.role === 'PROVIDER') {
          session.user.profileType = 'provider';
        } else {
          session.user.profileType = 'user';
        }
      }
      return session;
    },
    
    // ===============================================
    // SIGN IN CALLBACK
    // ===============================================
    async signIn({ user, account, profile }) {
      // Special handling for Google sign-in
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { profile: true }
          });
          
          // If user exists but has no profile, create one from Google data
          if (existingUser && !existingUser.profile) {
            await prisma.userProfile.create({
              data: {
                userId: existingUser.id,
                // Try different name options from Google profile
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
      return true; // Allow the sign in
    }
  },
  
  // ===============================================
  // CUSTOM PAGES
  // ===============================================
  pages: {
    signIn: '/signin',
    verifyRequest: '/verify-email',
    error: '/auth/error',
  },
  
  // JWT is used instead of database sessions for better performance
  session: {
    strategy: "jwt",
  },
  
  // Secret key used to sign tokens
  secret: process.env.NEXTAUTH_SECRET,
}
