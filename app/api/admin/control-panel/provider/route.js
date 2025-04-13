import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';

// Function to fetch providers
export async function GET(req) {
  try {
    const providers = await prisma.user.findMany({
      where: {
        role: "PROVIDER"
      },
      include: {
        providerProfile: true
      }
    });

    const formattedProviders = providers.map(user => ({
      id: user.id,
      profileId: user.providerProfile.id,
      email: user.email,
      name: user.providerProfile.name,
      businessName: user.providerProfile.businessName,
      phoneNumber: user.providerProfile.phoneNumber || 'N/A',
      address: user.providerProfile.address || 'N/A',
      logo: user.providerProfile.logo || null,
    }));

    return NextResponse.json(formattedProviders, { status: 200 });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }
}

// Function to create a new provider
export async function POST(req) {
  try {
    const data = await req.json();
    const { email, password, profileData } = data;

    // Check for duplicates
    // 1. Check for duplicate email
    const existingEmail = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (existingEmail) {
      return NextResponse.json({ error: 'email already exists' }, { status: 400 });
    }

    // 2. Check for duplicate business name
    const existingBusinessName = await prisma.providerProfile.findFirst({
      where: {
        businessName: profileData.businessName
      }
    });

    if (existingBusinessName) {
      return NextResponse.json({ error: 'business name already exists' }, { status: 400 });
    }

    // 3. Check for duplicate phone number
    const existingPhoneNumber = await prisma.providerProfile.findFirst({
      where: {
        phoneNumber: profileData.phoneNumber
      }
    });

    if (existingPhoneNumber) {
      return NextResponse.json({ error: 'phone number already exists' }, { status: 400 });
    }

    // If all checks passed, create the user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        role: "PROVIDER",
        password: hashedPassword,
        providerProfile: {
          create: profileData
        }
      }
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Error creating provider:", error);
    return NextResponse.json({ error: "Failed to create provider" }, { status: 500 });
  }
}

// Function to update an existing provider
export async function PATCH(req) {
  try {
    const data = await req.json();
    const { id, email, password, profileData } = data;

    // Find the user to ensure they exist
    const user = await prisma.user.findUnique({
      where: { id: id },
      include: { providerProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user data
    const updateData = {
      email: email,
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
    });

    // Update provider profile data
    const updatedProfile = await prisma.providerProfile.update({
      where: { userId: id },
      data: {
        name: profileData.name,
        businessName: profileData.businessName,
        description: profileData.description,
        address: profileData.address,
        phoneNumber: profileData.phoneNumber,
        businessHours: profileData.businessHours,
        logo: profileData.logo,
      },
    });

    return NextResponse.json({ user: updatedUser, profile: updatedProfile }, { status: 200 });
  } catch (error) {
    console.error("Error updating provider:", error);
    return NextResponse.json({ error: "Failed to update provider" }, { status: 500 });
  }
}

// Function to delete a provider
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Find the user to ensure they exist
    const user = await prisma.user.findUnique({
      where: { id: id },
      include: { providerProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete the provider
    await prisma.user.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: 'Provider deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting provider:", error);
    return NextResponse.json({ error: "Failed to delete provider" }, { status: 500 });
  }
}
