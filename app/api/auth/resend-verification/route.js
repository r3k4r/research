import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendVerificationCode } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const { email } = await req.json()
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { emailVerification: true }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 })
    }
    
    // Generate a new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    if (user.emailVerification) {
      // Update existing verification record
      await prisma.emailVerification.update({
        where: { userId: user.id },
        data: {
          token: verificationCode,
          expires: tokenExpiry
        }
      })
    } else {
      // Create new verification record
      await prisma.emailVerification.create({
        data: {
          userId: user.id,
          token: verificationCode,
          expires: tokenExpiry
        }
      })
    }
    
    // Send verification email
    await sendVerificationCode(email, verificationCode, 'email')
    
    return NextResponse.json({ message: 'Verification code sent' })
  } catch (error) {
    console.error('Error sending verification code:', error)
    return NextResponse.json({ error: 'An error occurred while sending the verification code' }, { status: 500 })
  }
}
