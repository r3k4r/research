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
    
    // Get current date for calculations
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    
    // Get orders data
    const orders = await prisma.purchasedOrder.findMany({
      where: { 
        providerId: providerId,
      },
    });
    
    const recentOrders = await prisma.purchasedOrder.findMany({
      where: { 
        providerId: providerId,
        createdAt: { gte: oneMonthAgo } 
      },
    });
    
    const previousMonthOrders = await prisma.purchasedOrder.findMany({
      where: { 
        providerId: providerId,
        createdAt: { 
          lt: oneMonthAgo,
          gte: new Date(oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1))
        } 
      },
    });
    
    // Calculate total revenue (80% of total sales, as provider gets 80%)
    const totalRevenue = recentOrders.reduce((sum, order) => sum + (order.totalAmount * 0.8), 0);
    const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + (order.totalAmount * 0.8), 0);
    
    // Calculate revenue change percentage
    const revenueChangePercentage = previousMonthRevenue > 0 
      ? Math.round(((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
      : 0;
    
    // Get pending orders
    const pendingOrders = await prisma.purchasedOrder.count({
      where: {
        providerId: providerId,
        status: 'PENDING'
      }
    });
    
    // Get active customers (unique customers in last 30 days)
    const activeCustomers = await prisma.purchasedOrder.groupBy({
      by: ['userProfileId'],
      where: {
        providerId: providerId,
        createdAt: { gte: oneMonthAgo }
      }
    });
    
    // Calculate average order value
    const averageOrder = recentOrders.length > 0 
      ? (recentOrders.reduce((sum, order) => sum + order.totalAmount, 0) / recentOrders.length)
      : 0;
    
    const previousAverageOrder = previousMonthOrders.length > 0
      ? (previousMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0) / previousMonthOrders.length)
      : 0;
    
    const averageOrderChangePercentage = previousAverageOrder > 0
      ? Math.round(((averageOrder - previousAverageOrder) / previousAverageOrder) * 100)
      : 0;
    
    return NextResponse.json({
      totalRevenue,
      totalOrders: recentOrders.length,
      pendingOrders,
      activeCustomers: activeCustomers.length,
      averageOrder,
      revenueChangePercentage,
      averageOrderChangePercentage
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
