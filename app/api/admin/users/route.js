import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs'


export async function GET(req) {
    try {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const role = url.searchParams.get("role");
        const search = url.searchParams.get("search");
        
        const skip = (page - 1) * limit;
        
        // Build where clause based on filters
        let where = {};
        
        if (role && role !== "all") {
            where.role = role;
        }
        
        if (search) {
            where.OR = [
                {
                    profile: {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    email: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    providerProfile: {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        
        // Get total count for pagination
        const totalUsers = await prisma.user.count({ where });
        
        // Get paginated users
        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                role: true,
                profile: true,
                providerProfile: true,
                createdAt: true,
                emailVerified: true,
                twoFactorEnabled: true,
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            users,
            pagination: {
                total: totalUsers,
                pages: Math.ceil(totalUsers / limit),
                page,
                limit
            }
        }, { status: 200 });
    } catch (err) {
        console.log(err);   
        return NextResponse.json({ error: 'An error occurred during fetching users' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const { email, role, password, profileData } = data;
        
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
        
        // 2. If it's a provider, check for duplicate business name
        if (role === "PROVIDER") {
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
        }
        
        // If all checks passed, create the user
        const hashedPassword = await bcrypt.hash(password, 10)
        
        // Create user with the appropriate profile based on role
        const user = await prisma.user.create({
            data: {
                email,
                role,
                password: hashedPassword,
                ...(role === "USER" && {
                    profile: {
                        create: profileData
                    }
                }),
                ...(role === "PROVIDER" && {
                    providerProfile: {
                        create: profileData
                    }
                })
            }
        });
        
        return NextResponse.json({ user }, { status: 201 });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ error: 'An error occurred during user creation' }, { status: 500 });
    }
}