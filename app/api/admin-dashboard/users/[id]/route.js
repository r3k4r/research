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
        console.log(err);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const userId = params.id;
        const data = await req.json();
        const { role, password, ...otherUpdateData } = data;
        console.log(data);
        
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

        // Update the user with new data
        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });
        
        // Handle role change to PROVIDER
        if (role === "PROVIDER") {
            // Delete user profile if exists
            if (currentUser.profile) {
                await prisma.userProfile.delete({
                    where: { userId: userId }
                });
            }
            
            // Create provider profile if doesn't exist
            if (!currentUser.providerProfile) {
                await prisma.providerProfile.create({
                    data: {
                        userId: userId,
                        name: currentUser.profile?.name || "New Provider",
                        businessName: "New Business",
                        address: "Address needed",
                        phoneNumber: currentUser.profile?.phoneNumber || "Phone needed",
                    }
                });
            }
        }
        
        // Handle role change to USER
        if (role === "USER") {
            // Delete provider profile if exists
            if (currentUser.providerProfile) {
                await prisma.providerProfile.delete({
                    where: { userId: userId }
                });
            }
            
            // Create user profile if doesn't exist
            if (!currentUser.profile) {
                await prisma.userProfile.create({
                    data: {
                        userId: userId,
                        name: currentUser.providerProfile?.name || "New User"
                    }
                });
            }
        }
        
        return NextResponse.json({ user }, { status: 200 });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ error: 'An error occurred during role update' }, { status: 500 });
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
        console.log(err);
        return NextResponse.json({ error: 'An error occurred during user deletion' }, { status: 500 });
    }
}
