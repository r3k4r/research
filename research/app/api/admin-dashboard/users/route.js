import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
prisma

export async function GET(req, res){
    try{
        const users = await prisma.user.findMany(
            {
                select:{
                    id: true,
                    email: true,
                    role: true,
                    profile: true,
                    providerProfile: true,
                }
            }
        );

        return NextResponse.json({users}, {status: 200});
    }catch(err){
        console.log(err);   
        return NextResponse.json({error: 'an error occure during fetching users'}, {status: 500});
    }
}