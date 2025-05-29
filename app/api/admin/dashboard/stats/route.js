import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get current date and format month boundaries properly
    const today = new Date();
    
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Fetch total users
    let totalUsers = 0;
    try {
      totalUsers = await prisma.user.count();
    } catch (e) {
    }
    
    // Fetch total food items
    let totalFoodItems = 0;
    try {
      totalFoodItems = await prisma.foodItem.count();
    } catch (e) {
    }
    
    // Calculate actual revenue from completed orders (taking 30% cut)
    let totalRevenue = 0;
    try {
      const orders = await prisma.purchasedOrder.findMany({
        where: {
          status: "DELIVERED" // Only count DELIVERED orders
        },
        select: {
          totalAmount: true
        }
      });
      
      
      // Calculate total revenue as 30% of all completed orders
      totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount * 0.2), 0);
        } catch (e) {
    }
    
    // Calculate growth based on user registrations (instead of orders)
    let growthRate = 0;
    let growthContext = {};
    try {
      // Count users registered this month
      const newUsersThisMonth = await prisma.user.count({
        where: {
          createdAt: {
            gte: currentMonthStart
          }
        }
      });
      
      // Count users registered last month
      const newUsersPrevMonth = await prisma.user.count({
        where: {
          createdAt: {
            gte: previousMonthStart,
            lt: currentMonthStart
          }
        }
      });
      
     
            
      // Calculate growth percentage with business-relevant logic
      if (newUsersPrevMonth > 0) {
        // Standard month-over-month growth calculation
        growthRate = ((newUsersThisMonth - newUsersPrevMonth) / newUsersPrevMonth) * 100;
      } else if (newUsersThisMonth > 0) {
        // We have users this month but none last month
        
        // Instead of fixed 100%, calculate a more meaningful value:
        // If we have existing users (platform not brand new), calculate growth
        // relative to total user base
        if (totalUsers > newUsersThisMonth) {
          // Calculate as percentage of new users relative to existing user base
          growthRate = (newUsersThisMonth / (totalUsers - newUsersThisMonth)) * 100;
        } else {
          // First month with users - use a more modest indicator based on actual count
          growthRate = Math.min(newUsersThisMonth * 5, 100); // Scale based on number of users, capped at 100%
        }
      } else {
        // No users in either month - no growth
        growthRate = 0;
      }
      
      // Add a sanity check for very low user counts
      if (totalUsers < 10 && newUsersThisMonth > 0) {
        // For very early-stage platforms, use more conservative growth indicators
        growthRate = Math.min(growthRate, 50 + (newUsersThisMonth * 5));
      }
      
      // Apply reasonable growth limits for all scenarios
      growthRate = Math.max(Math.min(growthRate, 200), -90);
      
      // Enhance growth context with more meaningful data
      growthContext = {
        newUsersThisMonth,
        newUsersPrevMonth,
        allUsersAreNew: totalUsers > 0 && totalUsers === newUsersThisMonth,
        percentageOfTotalUsers: totalUsers > 0 ? (newUsersThisMonth / totalUsers) * 100 : 0,
        isGrowthAccelerating: newUsersPrevMonth > 0 && 
                              newUsersThisMonth > newUsersPrevMonth && 
                              newUsersThisMonth / newUsersPrevMonth > 1.1
      };
    } catch (e) {
    }
    
    const result = {
      totalUsers,
      totalFoodItems,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      growthRate: parseFloat(growthRate.toFixed(1)),
      growthContext,
    };
    
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard statistics', 
        details: error?.message || 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
