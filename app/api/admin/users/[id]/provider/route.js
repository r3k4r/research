import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
    try {
        const userId = params.id;
        const data = await req.json();
        
        // Find the user to ensure they exist
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { providerProfile: true }
        });
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        // Update or create the provider profile
        let providerProfile;
        if (user.providerProfile) {
            // Update existing profile
            providerProfile = await prisma.providerProfile.update({
                where: { userId },
                data: {
                    name: data.name,
                    businessName: data.businessName,
                    description: data.description,
                    address: data.address,
                    phoneNumber: data.phoneNumber,
                    businessHours: data.businessHours,
                    logo: data.logo
                }
            });
        } else {
            // Create new profile
            providerProfile = await prisma.providerProfile.create({
                data: {
                    userId,
                    name: data.name,
                    businessName: data.businessName,
                    description: data.description,
                    address: data.address,
                    phoneNumber: data.phoneNumber,
                    businessHours: data.businessHours,
                    logo: data.logo
                }
            });
        }
        
        return NextResponse.json({ providerProfile }, { status: 200 });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ error: 'An error occurred updating provider profile' }, { status: 500 });
    }
}
