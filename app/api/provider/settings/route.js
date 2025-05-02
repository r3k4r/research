import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";

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
    
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    const result = await prisma.$transaction(async (prisma) => {
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
      
      let emailUpdateResult = null;
      let verificationNeeded = false;
      
      if (data.email && data.email !== currentUser.email) {
        emailUpdateResult = await prisma.user.update({
          where: { id: userId },
          data: { 
            email: data.email,
            emailVerified: null
          }
        });
        
        const token = randomUUID();
        const expires = new Date();
        expires.setHours(expires.getHours() + 24); 
        
        await prisma.emailVerification.deleteMany({
          where: { userId }
        });
        
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
