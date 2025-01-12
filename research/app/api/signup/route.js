import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { writeFile } from 'fs/promises'
import path from 'path'
import { sendVerificationCode } from '@/lib/email'
import { log } from 'console'


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
    const image = formData.get('image')

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

    // Handle image upload
    let imagePath = null
    if (image) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `${Date.now()}-${image.name}`
      const filePath = path.join(process.cwd(), 'public', 'images', fileName)
      await writeFile(filePath, buffer)
      imagePath = `/images/${fileName}`
    }

    // Generate email verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        location: city,
        phoneNumber,
        role: 'user',
        gender,
        image: imagePath,
        emailVerificationToken: verificationCode,
      },
    })

    // Send verification email
    await sendVerificationCode(email, verificationCode, 'email')

    return NextResponse.json({ message: 'User created successfully. Please check your email to verify your account.', user })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'An error occurred during signup' }, { status: 500 })
  }
}

