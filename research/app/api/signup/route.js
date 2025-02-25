import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { sendVerificationCode } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const formData = await req.formData()
    const name = formData.get('name')
    const email = formData.get('email')
    const password = formData.get('password')
    const city = formData.get('city')
    const phoneNumber = formData.get('phoneNumber')
    const gender = formData.get('gender')
   

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phoneNumber },
        ],
      },
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
      }
      if (existingUser.phoneNumber === phoneNumber) {
        return NextResponse.json({ error: 'User with this phone number already exists' }, { status: 400 })
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)


    // Generate verification token and expiry
    const verificationToken =  Math.floor(100000 + Math.random() * 900000).toString()
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        location: city,
        phoneNumber,
        role: 'USER',
        gender,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: tokenExpiry
      },
    })

    // Send verification email - fix the parameters to match the function signature
    await sendVerificationCode(email, verificationToken, 'email')

    return NextResponse.json({ 
      message: 'User created successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ 
      error: 'An error occurred during signup from server',
      details: error.message 
    }, { status: 500 })
  }
}

