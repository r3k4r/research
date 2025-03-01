import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
    try {
        const userId = params.id;
        const data = await req.json();
        
        // Find the user to ensure they exist
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true }
        });
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        // Update or create the user profile
        let profile;
        if (user.profile) {
            // Update existing profile
            profile = await prisma.userProfile.update({
                where: { userId },
                data: {
                    name: data.name,
                    location: data.location,
                    phoneNumber: data.phoneNumber,
                    gender: data.gender,
                    image: data.image
                }
            });
        } else {
            // Create new profile
            profile = await prisma.userProfile.create({
                data: {
                    userId,
                    name: data.name,
                    location: data.location,
                    phoneNumber: data.phoneNumber,
                    gender: data.gender,
                    image: data.image
                }
            });
        }
        
        return NextResponse.json({ profile }, { status: 200 });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ error: 'An error occurred updating user profile' }, { status: 500 });
    }
}
