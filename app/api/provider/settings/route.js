import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";

// GET: Fetch provider settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    const userId = session.user.id;
    
    // Get provider profile with user information
    const provider = await prisma.providerProfile.findUnique({
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
    
    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }
    
    return NextResponse.json(provider);
    
  } catch (error) {
    console.error("Error fetching provider settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PUT: Update provider settings
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    const userId = session.user.id;
    const data = await req.json();
    
    // Get current user data to check if email changed
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // Update provider profile
      const updatedProfile = await prisma.providerProfile.update({
        where: { userId },
        data: {
          name: data.name,
          businessName: data.businessName,
          description: data.description,
          address: data.address,
          businessHours: data.businessHours,
          logo: data.logo
        }
      });
      
      // Check if email needs to be updated
      let emailUpdateResult = null;
      let verificationNeeded = false;
      
      if (data.email && data.email !== currentUser.email) {
        // Email changed - update email and set emailVerified to null
        emailUpdateResult = await prisma.user.update({
          where: { id: userId },
          data: { 
            email: data.email,
            emailVerified: null
          }
        });
        
        // Create new email verification token
        const token = randomUUID();
        const expires = new Date();
        expires.setHours(expires.getHours() + 24); // Token valid for 24 hours
        
        // Delete any existing verification record
        await prisma.emailVerification.deleteMany({
          where: { userId }
        });
        
        // Create new verification record
        await prisma.emailVerification.create({
          data: {
            userId,
            token,
            expires
          }
        });
        
        verificationNeeded = true;
      }
      
      return {
        profile: updatedProfile,
        emailUpdated: emailUpdateResult !== null,
        verificationNeeded
      };
    });
    
    return NextResponse.json({
      message: "Settings updated successfully",
      ...result
    });
    
  } catch (error) {
    console.error("Error updating provider settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
