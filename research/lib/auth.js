import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }
        

        return user
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Skip email verification for OAuth providers
      if (account && account.provider !== 'credentials') {
        return true;
      }

      const dbUser = await prisma.user.findUnique({
        where: { email: user.email }
      });      

      // Check email verification and redirect if needed
      if (!dbUser?.emailVerified) {
        return `/verify-email?email=${user.email}`;
      }

      // Handle 2FA
      if (dbUser.twoFactorEnabled) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            twoFactorCode: code,
            twoFactorCodeExpires: expires
          }
        });

        // Send 2FA code via email
        await fetch('/api/email/send-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, code })
        });

        return `/two-factor?email=${user.email}`;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, 
  },
  secret: process.env.NEXTAUTH_SECRET, 
}

