import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(req) {
  const { email } = await req.json()

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hour from now

    // Delete any existing reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id }
    })

    // Create new password reset token
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expires: resetTokenExpires
      }
    })

    await sendPasswordResetEmail(email, resetToken)

    return NextResponse.json({ message: 'Password reset email sent' })
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return NextResponse.json({ error: 'An error occurred while sending the password reset email' }, { status: 500 })
  }
}

