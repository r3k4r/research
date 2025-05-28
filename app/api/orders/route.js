import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(req) {
  try {
    console.log("API Orders route called");
    
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      console.log("Unauthorized - no session or user");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log(`Getting profile for user: ${session.user.email}`);
    
    // Get the current user's profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    });
    
    if (!user) {
      console.log("User not found");
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (!user.profile) {
      console.log("User profile not found");
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const recentOnly = url.searchParams.get('recentOnly') === 'true';
    
    console.log(`Query params: status=${status}, recentOnly=${recentOnly}`);
    
    // Create the where clause
    const whereClause = {
      userProfileId: user.profile.id
    };
    
    // Add status filter if provided
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
      
      // If we're filtering for DELIVERED or CANCELLED orders and recentOnly is true,
      // only show orders from the last 24 hours
      if ((status.toUpperCase() === 'DELIVERED' || status.toUpperCase() === 'CANCELLED') && recentOnly) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        whereClause.createdAt = {
          gte: yesterday
        };
        
        console.log(`Filtering ${status.toUpperCase()} orders since: ${yesterday.toISOString()}`);
      }
    }
    
    console.log('Fetching orders with filter:', JSON.stringify(whereClause, null, 2));
    
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
    
    
    if (orders.length === 0) {
      console.log('No orders found matching criteria');
    } 
    
    const formattedOrders = orders.map(order => {
      const deliveryFee = 2500;
      const serviceFee = 500;
      
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        id: order.id,
        date: order.createdAt.toISOString(),
        status: order.status,
        isReviewed: order.isReviewed,
        items: order.items.map(item => ({
          id: item.id,
          foodItemId: item.foodItemId,  
          name: item.foodItem?.name ,
          quantity: item.quantity,
          price: item.price,
          image: item.foodItem?.image
        })),
        subtotal,
        deliveryFee,
        serviceFee,
        total: order.totalAmount,
        provider: order.provider?.businessName ,
        providerLogo: order.provider?.logo,
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
    return NextResponse.json({ error: 'Failed to fetch orders', details: error.message }, { status: 500 });
  }
}
