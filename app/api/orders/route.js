import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the current user's profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    });
    
    if (!user || !user.profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    
    // Create the where clause
    const whereClause = {
      userProfileId: user.profile.id
    };
    
    // Add status filter if provided
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }
    
    // Get orders
    const orders = await prisma.purchasedOrder.findMany({
      where: whereClause,
      include: {
        provider: {
          select: {
            businessName: true,
            logo: true,
            address: true
          }
        },
        items: {
          include: {
            foodItem: {
              select: {
                name: true,
                image: true
              }
            }
          }
        },
        statusLogs: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Format orders for the frontend
    const formattedOrders = orders.map(order => {
      // Calculate the fees
      const deliveryFee = 2500;
      const serviceFee = 500;
      
      // Calculate subtotal from actual items
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        id: order.id,
        date: order.createdAt.toISOString(),
        status: order.status,
        items: order.items.map(item => ({
          id: item.id,
          name: item.foodItem.name,
          quantity: item.quantity,
          price: item.price,
          image: item.foodItem.image
        })),
        subtotal,
        deliveryFee,
        serviceFee,
        total: order.totalAmount,
        provider: order.provider.businessName,
        providerLogo: order.provider.logo,
        deliveryAddress: order.deliveryAddress,
        deliveryNotes: order.deliveryNotes,
        paymentMethod: order.paymentMethod,
        estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toISOString() : null,
        timeline: order.statusLogs.map(log => ({
          status: log.status,
          date: log.createdAt.toISOString(),
          notes: log.notes
        }))
      };
    });
    
    return NextResponse.json(formattedOrders);
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
