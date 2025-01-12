import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req) {
  const { email, code } = await req.json()

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.twoFactorCode !== code || user.twoFactorCodeExpires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired two-factor code' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorCode: null,
        twoFactorCodeExpires: null,
      },
    })

    return NextResponse.json({ message: 'Two-factor authentication successful' })
  } catch (error) {
    console.error('Error during two-factor authentication:', error)
    return NextResponse.json({ error: 'An error occurred during two-factor authentication' }, { status: 500 })
  }
}

