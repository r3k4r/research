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
      const orders = await prisma.order.findMany({
        where: {
          status: "DELIVERED" // Only count DELIVERED orders
        },
        select: {
          totalAmount: true
        }
      });
      console.log('Orders data:', orders);
      
      
      // Calculate total revenue as 30% of all completed orders
      totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount * 0.3), 0);
        } catch (e) {
      console.log('Error calculating revenue:', e?.message || 'Unknown error');
    }
    
    // Calculate growth based on user registrations (instead of orders)
    let growthRate = 0;
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
            
      // Calculate growth percentage
      if (newUsersPrevMonth > 0) {
        growthRate = ((newUsersThisMonth - newUsersPrevMonth) / newUsersPrevMonth) * 100;
      } else if (newUsersThisMonth > 0) {
        growthRate = 100; // If no users last month but some this month
      }      
    } catch (e) {
      console.log('Error calculating growth rate:', e?.message || 'Unknown error');
    }
    
    const result = {
      totalUsers,
      totalFoodItems,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      growthRate: parseFloat(growthRate.toFixed(1)),
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
