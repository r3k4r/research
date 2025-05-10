import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { sendVerificationCode } from "@/lib/email";
import bcrypt from "bcryptjs";

// GET: Fetch the user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            emailVerified: true
          }
        }
      }
    });
    
    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    
    return NextResponse.json(userProfile);
    
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PUT: Update the user profile
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const data = await req.json();
    
    // Check if the phone number is already in use by another user
    if (data.phoneNumber) {
      const existingUserWithPhone = await prisma.userProfile.findFirst({
        where: {
          phoneNumber: data.phoneNumber,
          userId: { not: userId }
        }
      });
      
      if (existingUserWithPhone) {
        return NextResponse.json({ error: "Phone number is already in use" }, { status: 400 });
      }
    }
    
    // Get the current user's email for comparison
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    // Start a transaction to handle profile update, password change, and email change if needed
    const result = await prisma.$transaction(async (prisma) => {
      // Update the user profile
      const updatedProfile = await prisma.userProfile.update({
        where: { userId },
        data: {
          name: data.name,
          location: data.location,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          image: data.image
        }
      });

      // If password is provided, update it
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await prisma.user.update({
          where: { id: userId },
          data: {
            password: hashedPassword
          }
        });
      }
      
      // Handle email change if provided
      let emailUpdateResult = null;
      let verificationNeeded = false;
      
      if (data.email && data.email !== currentUser.email) {
        // Check if the email is already in use
        const existingUserWithEmail = await prisma.user.findUnique({
          where: { email: data.email }
        });
        
        if (existingUserWithEmail) {
          throw new Error("Email already in use");
        }
        
        // Update the email and remove verification
        emailUpdateResult = await prisma.user.update({
          where: { id: userId },
          data: { 
            email: data.email,
            emailVerified: null
          }
        });
        
        // Create verification token
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date();
        expires.setHours(expires.getHours() + 24);
        
        // Remove any existing verification tokens
        await prisma.emailVerification.deleteMany({
          where: { userId }
        });
        
        // Create new verification token
        await prisma.emailVerification.create({
          data: {
            userId,
            token: verificationCode,
            expires
          }
        });
        
        // Send verification email
        await sendVerificationCode(data.email, verificationCode, 'email');
        
        verificationNeeded = true;
      }
      
      return {
        profile: updatedProfile,
        emailUpdated: emailUpdateResult !== null,
        verificationNeeded
      };
    });
    
    return NextResponse.json({
      message: "Profile updated successfully",
      ...result
    });
    
  } catch (error) {
    console.error("Error updating user profile:", error);
    
    if (error.message === "Email already in use") {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

// POST: Send verification email
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Delete any existing verification tokens
    await prisma.emailVerification.deleteMany({
      where: { userId }
    });
    
    // Generate a verification code - 6 digit number
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry for 24 hours
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Create the verification record
    await prisma.emailVerification.create({
      data: {
        userId,
        token: verificationCode,
        expires
      }
    });
    
    // Send the verification email
    await sendVerificationCode(user.email, verificationCode, 'email');
    
    return NextResponse.json({ 
      message: "Verification email sent successfully",
      email: user.email,
      maskedEmail: user.email.replace(/(.{2})(.*)(?=@)/, 
        function(_, a, b) { return a + b.replace(/./g, '*'); })
    });
    
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
  }
}
