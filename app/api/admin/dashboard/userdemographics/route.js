import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Direct query to get all profiles with their gender
    const profiles = await prisma.userProfile.findMany({
      select: {
        gender: true
      }
    });
    
    // Count males and females manually
    let maleCount = 0;
    let femaleCount = 0;
    
    profiles.forEach(profile => {
      if (profile.gender === "male") maleCount++;
      if (profile.gender === "female") femaleCount++;
    });
    
    console.log(`Found ${profiles.length} profiles: ${maleCount} males, ${femaleCount} females`);
    
    // Format data for Chart.js
    const chartData = {
      labels: ['Male', 'Female'],
      datasets: [
        {
          data: [maleCount, femaleCount],
          backgroundColor: ['#3b82f6', '#ec4899'],
          borderColor: ['#2563eb', '#db2777'],
          borderWidth: 1,
        },
      ],
    };
    
    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Error fetching gender data:", error);
    return NextResponse.json(
      { error: "Failed to fetch gender data" },
      { status: 500 }
    );
  }
}
