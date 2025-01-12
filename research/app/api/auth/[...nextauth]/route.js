import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { sendVerificationCode } from "@/lib/email"


const prisma = new PrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

