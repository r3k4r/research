import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get current date
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    // Fetch total users (handle case where no users exist)
    const totalUsers = await prisma.user.count() || 0;
    
    // Fetch total food items (handle case where no food items exist)
    const totalFoodItems = await prisma.foodItem.count() || 0;
    
    // Calculate total revenue (safely handle case where no orders exist)
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    });
    const totalRevenue = revenueResult._sum?.totalAmount || 0;
    
    // Calculate current month revenue (safely handle null values)
    const currentMonthRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: lastMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });
    
    // Calculate previous month revenue (safely handle null values)
    const previousMonthRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: twoMonthsAgo,
          lt: lastMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });
    
    // Calculate growth rate (with better null handling)
    const currentRev = currentMonthRevenue._sum?.totalAmount || 0;
    const prevRev = previousMonthRevenue._sum?.totalAmount || 0;
    let growthRate = 0;
    
    if (prevRev > 0) {
      growthRate = ((currentRev - prevRev) / prevRev) * 100;
    } else if (currentRev > 0) {
      growthRate = 100; // If previous revenue was 0 but current is positive, that's 100% growth
    }
    
    const result = {
      totalUsers,
      totalFoodItems,
      totalRevenue,
      growthRate: parseFloat(growthRate.toFixed(1)), // Round to 1 decimal for display
    };
    
    console.log('Response data:', result);
    
    // Make sure we're returning proper JSON
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Make sure the error response is valid JSON
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error.message },
      { status: 500 }
    );
  }
}
