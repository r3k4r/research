import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(req, { params}) {
    const  id  = params.id;

    console.log('Bakchend id', id);

   
}