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
        const { role, ...updateData } = data;
        console.log(updateData);
        
        
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

        const hashedPassword = await bcrypt.hash(updateData.password, 10);

        // Update the user with new role
        const user = await prisma.user.update({
            where: { id: userId },
            data: { 
                role,
                ...updateData,
                password: hashedPassword,
            }
        });
        
        // If role changed to PROVIDER and they don't have a provider profile, create one
        if (role === "PROVIDER" && !currentUser.providerProfile) {
            // Create a basic provider profile
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
        
        // If role changed to USER and they don't have a user profile, create one
        if (role === "USER" && !currentUser.profile) {
            await prisma.userProfile.create({
                data: {
                    userId: userId,
                    name: currentUser.providerProfile?.name || "New User"
                }
            });
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
