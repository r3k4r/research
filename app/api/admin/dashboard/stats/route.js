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
      console.log('Error fetching user count:', e?.message || 'Unknown error');
    }
    
    // Fetch total food items
    let totalFoodItems = 0;
    try {
      totalFoodItems = await prisma.foodItem.count();
    } catch (e) {
      console.log('Error fetching food items count:', e?.message || 'Unknown error');
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
      console.log('Error calculating revenue:', e?.message || 'Unknown error');
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
        // For new platforms, show positive growth based on actual user count
        growthRate = 100; // Fixed positive indicator when we're just starting
      } else {
        // No users in either month - no growth (stays at 0%)
        growthRate = 0;
      }
      
      // If all users are from this month, show appropriate growth
      if (totalUsers > 0 && totalUsers === newUsersThisMonth) {
        // All our users are new this month - set positive growth indicator
        growthRate = 100;
      }
      
      // Apply reasonable growth limits only for extreme values
      growthRate = Math.max(Math.min(growthRate, 200), -90);
      
      // Add additional growth context
      growthContext = {
        newUsersThisMonth,
        newUsersPrevMonth,
        allUsersAreNew: totalUsers > 0 && totalUsers === newUsersThisMonth,
        isGrowthAccelerating: newUsersPrevMonth > 0 && 
                              newUsersThisMonth > newUsersPrevMonth && 
                              newUsersThisMonth / newUsersPrevMonth > 1.1
      };
    } catch (e) {
      console.log('Error calculating growth rate:', e?.message || 'Unknown error');
    }
    
    const result = {
      totalUsers,
      totalFoodItems,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      growthRate: parseFloat(growthRate.toFixed(1)),
      growthContext,
    };
    
    console.log('API response data (real calculations):', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.log('Error in dashboard stats API:', error?.message || 'Unknown error');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard statistics', 
        details: error?.message || 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
