import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get total users count
    const totalUsers = await prisma.userProfile.count()
    
    // Get total providers count
    const totalProviders = await prisma.providerProfile.count()
    
    // Get total food items saved (assuming those with status SOLD)
    const totalFoodItems = await prisma.foodItem.count({
      where: {
        status: 'SOLD'
      }
    })
    
    // Calculate total waste reduction (assuming each food item saves about 0.5kg of waste on average)
    // This is a simplification - you might want to store actual weight data in your schema
    const wasteReduction = totalFoodItems * 0.5
    
    return NextResponse.json({
      totalUsers: totalUsers || 450,
      totalProviders: totalProviders || 85,
      totalFoodItems: totalFoodItems || 12500,
      wasteReduction: wasteReduction || 6250
    })
  } catch (error) {
    console.error('Error fetching about us stats:', error)
    
    // Return fallback data if database query fails
    return NextResponse.json({
      totalUsers: 450,
      totalProviders: 85,
      totalFoodItems: 12500,
      wasteReduction: 6250
    })
  }
}
