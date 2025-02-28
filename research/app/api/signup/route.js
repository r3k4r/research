import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { sendVerificationCode } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    // Get form data from request
    const formData = await req.formData()
    const name = formData.get('name')
    const email = formData.get('email')
    const password = formData.get('password')
    const city = formData.get('city')
    const phoneNumber = formData.get('phoneNumber')
    const gender = formData.get('gender')
   
    // Check if user already exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }
    
    // Check if phone number is already used
    const existingPhone = await prisma.userProfile.findFirst({
      where: { phoneNumber }
    })
    
    if (existingPhone) {
      return NextResponse.json({ error: 'User with this phone number already exists' }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate verification token
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user with nested profile in one operation (without token fields)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'USER',
        // Create profile in the same operation
        profile: {
          create: {
            name,
            location: city,
            phoneNumber,
            gender
          }
        }
      },
      // Include profile in results
      include: {
        profile: true
      }
    })

    // After user is created, create the email verification record
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expires: tokenExpiry
      }
    })

    // Send verification email
    await sendVerificationCode(email, verificationToken, 'email')

    return NextResponse.json({ 
      message: 'User created successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.profile.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ 
      error: 'An error occurred during signup',
      details: error.message 
    }, { status: 500 })
  }
}

