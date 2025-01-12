import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendWelcomeEmail } from '@/lib/email'


const prisma = new PrismaClient()

export async function POST(req) {
  const { token } = await req.json()

  try {
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
      },
    })

   sendWelcomeEmail(user.email, user.name)

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json({ error: 'An error occurred during verification' }, { status: 500 })
  }
}

