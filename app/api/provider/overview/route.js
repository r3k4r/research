import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { providerProfile: true }
    });
    
    if (!user || !user.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }
    
    const providerId = user.providerProfile.id;
    
    const dates = [];
    const labels = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      dates.push(date);
      labels.push(label);
    }
    
    const salesData = [];
    
    for (let i = 0; i < dates.length; i++) {
      const startDate = dates[i];
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      const orders = await prisma.purchasedOrder.findMany({
        where: {
          providerId: providerId,
          createdAt: {
            gte: startDate,
            lt: endDate
          }
        }
      });
      
      const dailyRevenue = orders.reduce((sum, order) => sum + (order.totalAmount * 0.8), 0);
      
      salesData.push({
        name: labels[i],
        total: parseFloat(dailyRevenue.toFixed(2))
      });
    }
    
    return NextResponse.json(salesData);
    
  } catch (error) {
    console.error('Error fetching overview data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
