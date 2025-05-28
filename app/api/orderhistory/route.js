import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    });
    
    if (!user || !user.profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const whereClause = {
      userProfileId: user.profile.id,
      status: { in: ['DELIVERED', 'CANCELLED'] }
    };
    
    // Get order count for pagination
    const totalOrders = await prisma.purchasedOrder.count({
      where: whereClause
    });
    
    // Get orders with pagination
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
                id: true,
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
      },
      skip,
      take: limit
    });
    
    // Format orders for the frontend
    const formattedOrders = orders.map(order => {
      // Calculate fees
      const deliveryFee = 2500;
      const serviceFee = 500;
      
      // Calculate subtotal from actual items
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        id: order.id,
        date: order.createdAt.toISOString(),
        status: order.status,
        isReviewed: order.isReviewed,
        items: order.items.map(item => ({
          id: item.id,
          foodItemId: item.foodItemId,
          name: item.foodItem?.name || "Unknown Item",
          quantity: item.quantity,
          price: item.price,
          image: item.foodItem?.image
        })),
        subtotal,
        deliveryFee,
        serviceFee,
        total: order.totalAmount,
        provider: order.provider?.businessName || "Unknown Provider",
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
    
    // Return with pagination metadata
    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        pages: Math.ceil(totalOrders / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching order history:', error?.message || 'Unknown error');
    return NextResponse.json({ 
      error: 'Failed to fetch order history', 
      details: error?.message || 'Unknown error' 
    }, { status: 500 });
  }
}