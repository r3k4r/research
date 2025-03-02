import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendWelcomeEmail } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const { email, code } = await req.json()

    // Find the email verification record
    const verification = await prisma.emailVerification.findFirst({
      where: {
        token: code,
        expires: {
          gt: new Date()
        },
        user: {
          email: email
        }
      },
      include: {
        user: true
      }
    })

    if (!verification) {
      return NextResponse.json({ 
        error: 'Invalid or expired verification code' 
      }, { status: 400 })
    }

    // Update user verification status
    const updatedUser = await prisma.user.update({
      where: { id: verification.userId },
      data: {
        emailVerified: new Date(),
      },
    })

    // Delete the verification record
    await prisma.emailVerification.delete({
      where: { id: verification.id }
    })

    if (updatedUser.emailVerified) {
      // Get the user's name from profile
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId: updatedUser.id }
      })
      
      // Send welcome email
      await sendWelcomeEmail(email, userProfile?.name || email.split('@')[0])
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

