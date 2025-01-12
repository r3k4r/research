import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendVerificationCode } from "./email"



const prisma = new PrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
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
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return user
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.emailVerified = user.emailVerified
        token.twoFactorEnabled = user.twoFactorEnabled
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.emailVerified = token.emailVerified
        session.user.twoFactorEnabled = token.twoFactorEnabled
      }
      return session
    },
    async signIn({ user }) {
      if (!user.emailVerified) {
        // Generate and save email verification token
        const token = crypto.randomBytes(32).toString('hex')
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            emailVerificationToken: token,
          }
        })

        // Send verification email
        await sendVerificationCode(user.email, token, 'email')

        return `/verify-email?email=${user.email}`
      }

      if(user && user.emailVerified && !user.twoFactorEnabled){
        return true
      }

      if (user.twoFactorEnabled) {
        // Generate and save 2FA code
        const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString()
        await prisma.user.update({
          where: { id: user.id },
          data: {
            twoFactorCode: twoFactorCode,
            twoFactorCodeExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
          }
        })

        // Send 2FA code via email
        await sendVerificationCode(user.email, twoFactorCode, '2fa')

        return `/two-factor?email=${user.email}`
      }

      return true
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



