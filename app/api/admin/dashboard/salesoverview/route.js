import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the last 7 days for the chart
    const dates = [];
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      // Format date for display (e.g., "Mon", "Tue")
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      dates.push(date);
      labels.push(label);
    }

    // For each day, get the total revenue from delivered orders
    const salesData = [];
    
    for (const date of dates) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      // Find orders for this day
      const orders = await prisma.purchasedOrder.findMany({
        where: {
          status: "DELIVERED",
          updatedAt: {
            gte: date,
            lt: nextDay,
          }
        },
        select: {
          totalAmount: true,
        }
      });
      
      // Calculate revenue (20% commission)
      const dailyRevenue = orders.reduce((sum, order) => sum + (order.totalAmount * 0.2), 0);
      salesData.push(parseFloat(dailyRevenue.toFixed(2)));
    }

    // Return formatted chart data
    const result = {
      labels,
      datasets: [
        {
          label: 'Sales',
          data: salesData,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.3,
        }
      ]
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating sales data:', error);
    return NextResponse.json(
      { error: 'Failed to generate sales overview data' },
      { status: 500 }
    );
  }
}
