import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { writeFile } from 'fs/promises'
import path from 'path'
import { z } from 'zod'

const prisma = new PrismaClient()

const signUpSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.password().min(8, "Password must be at least 8 characters"),
  city: z.string().min(1, "City is required"),
  phoneNumber: z.string().regex(/^\d{11}$/, "Phone number must be 11 digits"),
  gender: z.enum(['male', 'female']),
  image: z.any().optional(),
})

export async function POST(req) {
  try {
    const formData = await req.formData()
    const validatedData = signUpSchema.parse(Object.fromEntries(formData))

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { phoneNumber: validatedData.phoneNumber },
        ],
      },
    })

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
      }
      if (existingUser.phoneNumber === validatedData.phoneNumber) {
        return NextResponse.json({ error: 'User with this phone number already exists' }, { status: 400 })
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Handle image upload
    let imagePath = null
    if (validatedData.image) {
      const file = validatedData.image
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `${Date.now()}-${file.name}`
      const filePath = path.join(process.cwd(), 'public', 'images', fileName)
      await writeFile(filePath, buffer)
      imagePath = `/images/${fileName}`
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        location: validatedData.city,
        phoneNumber: validatedData.phoneNumber,
        role: 'user',
        gender: validatedData.gender,
        image: imagePath,
      },
    })

    return NextResponse.json({ message: 'User created successfully', user })
  } catch (error) {
    console.error('Signup error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An error occurred during signup' }, { status: 500 })
  }
}

