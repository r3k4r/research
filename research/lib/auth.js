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
  // Use our custom adapter that knows how to handle the normalized schema
  adapter: CustomPrismaAdapter(prisma),
  
  // ===============================================
  // AUTH PROVIDERS
  // ===============================================
  // Different ways users can authenticate with the app
  providers: [
    // 1. Google OAuth - "Sign in with Google"
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    // 2. Email/Password - Traditional login
    CredentialsProvider({
      name: "credentials",
      // Define what fields are needed for login
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" },
      },
      
      // ===============================================
      // LOGIN AUTHORIZATION FUNCTION
      // ===============================================
      // This is where the actual login verification happens
      async authorize(credentials) {
        // Basic validation
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        // Find the user with their profile data
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { 
            profile: true,
            providerProfile: true 
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
        // If email not verified, send verification code
        if (!user.emailVerified) {
          const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              emailVerificationToken: verificationCode,
              emailVerificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
          })

          // Send email with code
          await sendVerificationCode(user.email, verificationCode, 'email')
          throw new Error("EmailNotVerified")
        }

        // ===============================================
        // TWO-FACTOR AUTHENTICATION (2FA)
        // ===============================================
        // If 2FA is enabled for this user
        if (user.twoFactorEnabled) {
          // If no 2FA code provided yet, send one
          if (!credentials.twoFactorCode) {
            const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString()
            await prisma.user.update({
              where: { id: user.id },
              data: {
                twoFactorCode,
                twoFactorCodeExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
              }
            })

            // Send code via email
            await sendVerificationCode(user.email, twoFactorCode, '2fa')
            throw new Error("TwoFactorRequired")
          }

          // Verify the provided 2FA code
          if (user.twoFactorCode !== credentials.twoFactorCode || user.twoFactorCodeExpires < new Date()) {
            throw new Error("Invalid 2FA code")
          }

          // Clear the used 2FA code
          await prisma.user.update({
            where: { id: user.id },
            data: {
              twoFactorCode: null,
              twoFactorCodeExpires: null,
            }
          })
        }

        // ===============================================
        // ADD PROFILE DATA TO USER OBJECT
        // ===============================================
        // Create user object with profile info for NextAuth
        let userWithProfile = { ...user };
        
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
  // These functions customize the authentication flow
  callbacks: {
    // ===============================================
    // JWT CALLBACK
    // ===============================================
    // Called whenever a JWT (JSON Web Token) is created or updated
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
      // Always get the latest user data on every token refresh
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
      // If user signed in with Google, their email is already verified
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
    // Called whenever a session is checked (on every request with getServerSession)
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
    // Called when a user signs in
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
  // Custom URLs for authentication pages
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

// ===============================================
// OVERALL SUMMARY
// ===============================================
// This authentication system:
// 1. Works with our normalized database schema
// 2. Supports both email/password and Google login
// 3. Handles email verification and 2FA
// 4. Keeps profile data in sync for both user types
// 5. Provides consistent session data across the app

