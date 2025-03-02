import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req) {
  const { token, password } = await req.json()

  try {
    // Find the reset token record
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        token: token,
        expires: {
          gt: new Date()
        }
      }
    })

    if (!passwordReset) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update the user's password
    await prisma.user.update({
      where: { id: passwordReset.userId },
      data: {
        password: hashedPassword
      }
    })
    
    // Delete the reset token
    await prisma.passwordReset.delete({
      where: { id: passwordReset.id }
    })

    return NextResponse.json({ message: 'Password reset successful' })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ error: 'An error occurred while resetting the password' }, { status: 500 })
  }
}

