import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req) {
  const { token, password } = await req.json()

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    })

    return NextResponse.json({ message: 'Password reset successful' })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ error: 'An error occurred while resetting the password' }, { status: 500 })
  }
}

