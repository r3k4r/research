import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendWelcomeEmail } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const { email, code } = await req.json()

    const user = await prisma.user.findFirst({
      where: {
        email: email,
        emailVerificationToken: code,
        emailVerificationTokenExpires: {
          gt: new Date()
        }
      },
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid or expired verification code' 
      }, { status: 400 })
    }

    // Update user verification status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
      },
    })

    if (updatedUser.emailVerified) {
      // Send welcome email
      await sendWelcomeEmail(user.email, user.name)
    }

    return NextResponse.json({ 
      message: 'Email verified successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified
      }
    })
    
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json({ 
      error: 'An error occurred during verification',
      details: error.message 
    }, { status: 500 })
  }
}

