import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req) {
  const { email, code } = await req.json()

  try {
    // Find user to get their ID
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find the 2FA code
    const twoFactorAuth = await prisma.twoFactorAuth.findFirst({
      where: { 
        userId: user.id,
        code: code,
        expires: {
          gt: new Date()
        }
      }
    })

    if (!twoFactorAuth) {
      return NextResponse.json({ error: 'Invalid or expired two-factor code' }, { status: 400 })
    }

    // Delete the two-factor auth record
    await prisma.twoFactorAuth.delete({
      where: { id: twoFactorAuth.id }
    })

    return NextResponse.json({ message: 'Two-factor authentication successful' })
  } catch (error) {
    console.error('Error during two-factor authentication:', error)
    return NextResponse.json({ error: 'An error occurred during two-factor authentication' }, { status: 500 })
  }
}

