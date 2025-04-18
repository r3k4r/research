import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the current user and verify provider status
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { providerProfile: true }
    });
    
    if (!user || !user.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }
    
    const providerId = user.providerProfile.id;
    
    // Parse limit from query parameters (default to 10)
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    // Get recent orders with user profile info
    const orders = await prisma.purchasedOrder.findMany({
      where: { 
        providerId: providerId 
      },
      include: {
        userProfile: true,
        items: {
          include: {
            foodItem: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
    
    // Format the orders for the frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      customer: order.userProfile.name,
      date: order.createdAt.toISOString(),
      status: order.status,
      amount: order.totalAmount,
      items: order.items.map(item => ({
        id: item.id,
        name: item.foodItem.name,
        quantity: item.quantity,
        price: item.price
      }))
    }));
    
    return NextResponse.json(formattedOrders);
    
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
