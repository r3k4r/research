import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';

export async function GET(req, { params }) {
    try {
        const userId = params.id;
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                providerProfile: true
            }
        });
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json({ user }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const userId = params.id;
        const data = await req.json();
        const { role, password, profileData, ...otherUpdateData } = data;
        
        // First get the current user to check their role
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                providerProfile: true
            }
        });
        
        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prepare update data
        const updateData = { 
            role,
            ...otherUpdateData
        };
        
        // Only hash and update password if it's provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        // If changing to PROVIDER role, check if the business name already exists
        if (role === "PROVIDER" && profileData?.businessName && currentUser.role !== "PROVIDER") {
            const existingBusinessName = await prisma.providerProfile.findFirst({
                where: { 
                    businessName: profileData.businessName,
                    userId: { not: userId }
                }
            });
            
            if (existingBusinessName) {
                return NextResponse.json({ error: 'Business name already exists' }, { status: 400 });
            }
        }

        // Update the user within a transaction for consistency
        await prisma.$transaction(async (tx) => {
            // 1. Update the user basic data
            await tx.user.update({
                where: { id: userId },
                data: updateData
            });
            
            // 2. Handle role change to PROVIDER
            if (role === "PROVIDER") {
                // Delete user profile if exists
                if (currentUser.profile) {
                    await tx.userProfile.delete({
                        where: { userId: userId }
                    });
                }
                
                // Create provider profile if doesn't exist
                if (!currentUser.providerProfile) {
                    // Use provided profile data or create sensible defaults
                    await tx.providerProfile.create({
                        data: {
                            userId: userId,
                            name: profileData?.name || currentUser.profile?.name || "New Provider",
                            businessName: profileData?.businessName || "New Business",
                            address: profileData?.address || "Enter address",
                            phoneNumber: profileData?.phoneNumber || currentUser.profile?.phoneNumber || "Enter phone",
                            description: profileData?.description || null,
                            businessHours: profileData?.businessHours || null,
                            logo: profileData?.logo || null,
                        }
                    });
                } else if (profileData) {
                    // Update existing provider profile with new data
                    await tx.providerProfile.update({
                        where: { userId: userId },
                        data: {
                            name: profileData.name || currentUser.providerProfile.name,
                            businessName: profileData.businessName || currentUser.providerProfile.businessName,
                            address: profileData.address || currentUser.providerProfile.address,
                            phoneNumber: profileData.phoneNumber || currentUser.providerProfile.phoneNumber,
                            description: profileData.description || currentUser.providerProfile.description,
                            businessHours: profileData.businessHours || currentUser.providerProfile.businessHours,
                            logo: profileData.logo || currentUser.providerProfile.logo,
                        }
                    });
                }
            }
            
            // 3. Handle role change to USER
            if (role === "USER") {
                // Delete provider profile if exists
                if (currentUser.providerProfile) {
                    await tx.providerProfile.delete({
                        where: { userId: userId }
                    });
                }
                
                // Create user profile if doesn't exist
                if (!currentUser.profile) {
                    await tx.userProfile.create({
                        data: {
                            userId: userId,
                            name: profileData?.name || currentUser.providerProfile?.name || "New User",
                            location: profileData?.location || null,
                            phoneNumber: profileData?.phoneNumber || currentUser.providerProfile?.phoneNumber || null,
                            gender: profileData?.gender || null,
                            image: profileData?.image || null
                        }
                    });
                } else if (profileData) {
                    // Update existing user profile
                    await tx.userProfile.update({
                        where: { userId: userId },
                        data: {
                            name: profileData.name || currentUser.profile.name,
                            location: profileData.location || currentUser.profile.location,
                            phoneNumber: profileData.phoneNumber || currentUser.profile.phoneNumber,
                            gender: profileData.gender || currentUser.profile.gender,
                            image: profileData.image || currentUser.profile.image,
                        }
                    });
                }
            }
        });
        
        // Get updated user data for response
        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true, 
                providerProfile: true
            }
        });
        
        return NextResponse.json({ user: updatedUser }, { status: 200 });
    } catch (err) {
        console.error("Error updating user:", err);
        return NextResponse.json({ error: `An error occurred during role update: ${err.message}` }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const userId = params.id;
        
        await prisma.user.delete({
            where: { id: userId }
        });
        
        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'An error occurred during user deletion' }, { status: 500 });
    }
}
