import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get user registrations for the last 6 months
    const months = [];
    const labels = [];
    const today = new Date();
    
    // Generate the last 6 months (including current)
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      
      // Format month for display (e.g., "Jan", "Feb")
      const label = month.toLocaleDateString('en-US', { month: 'short' });
      
      months.push(month);
      labels.push(label);
    }

    // For each month, count new user registrations
    const userData = [];
    
    for (let i = 0; i < months.length; i++) {
      const startOfMonth = months[i];
      
      // Calculate end of month
      let endOfMonth;
      if (i === months.length - 1) {
        // For current month, use today as the end
        endOfMonth = new Date();
      } else {
        // For past months, use the start of next month
        endOfMonth = new Date(months[i + 1]);
      }
      
      // Count users created in this month
      const userCount = await prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lt: endOfMonth,
          }
        }
      });
      
      userData.push(userCount);
    }

    // Return formatted chart data
    const result = {
      labels,
      datasets: [
        {
          label: 'New Users',
          data: userData,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }
      ]
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating user growth data:', error);
    return NextResponse.json(
      { error: 'Failed to generate user growth data' },
      { status: 500 }
    );
  }
}
