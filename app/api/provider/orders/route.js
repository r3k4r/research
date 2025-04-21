import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET handler for fetching provider orders
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
    
    // Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    
    // Build the where clause
    let whereClause = { providerId };
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause.OR = [
        { id: { contains: search } },
        { userProfile: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    // Get orders with related data
    const orders = await prisma.purchasedOrder.findMany({
      where: whereClause,
      include: {
        userProfile: true,
        items: {
          include: {
            foodItem: true
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
    
    // Format the response
    const formattedOrders = orders.map(order => {
      // Calculate all price components in the backend
      const deliveryFee = 2000; // standard delivery fee in IQD
      
      // Calculate subtotal from actual items
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Calculate total with the delivery fee
      const total = subtotal + deliveryFee;

      return {
        id: order.id,
        customerName: order.userProfile.name,
        date: order.createdAt.toISOString(),
        status: order.status,
        subtotal, // Item sum
        deliveryFee, // Fixed delivery fee
        totalAmount: total, // Total with delivery
        items: order.items.map(item => ({
          name: item.foodItem.name,
          quantity: item.quantity,
          price: item.price
        })),
        address: order.deliveryAddress,
        phone: order.userProfile.phoneNumber || 'Not provided',
        deliveryNotes: order.deliveryNotes,
        statusLogs: order.statusLogs.map(log => ({
          status: log.status,
          notes: log.notes,
          date: log.createdAt.toISOString()
        }))
      };
    });
    
    return NextResponse.json(formattedOrders);
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST handler for updating order status
export async function POST(req) {
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
    
    // Parse request body
    const data = await req.json();
    const { orderId, status, notes, action } = data;
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Get the order and verify ownership
    const order = await prisma.purchasedOrder.findUnique({
      where: { id: orderId },
      include: { statusLogs: { orderBy: { createdAt: 'desc' } } }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    if (order.providerId !== providerId) {
      return NextResponse.json({ error: 'You do not own this order' }, { status: 403 });
    }

    // Handle different actions
    if (action === 'go-back') {
      // Get previous status from logs, excluding the current status
      const statusHistory = order.statusLogs
        .filter(log => log.status !== order.status)
        .map(log => log.status);
      
      // If there's no previous status, can't go back
      if (statusHistory.length === 0) {
        return NextResponse.json({ 
          error: 'Cannot go back - this is the initial status' 
        }, { status: 400 });
      }
      
      // Get the most recent previous status
      const previousStatus = statusHistory[0];
      
      // Update order to the previous status
      const updatedOrder = await prisma.purchasedOrder.update({
        where: { id: orderId },
        data: { status: previousStatus }
      });
      
      // Create a status log entry for going back
      await prisma.orderStatusLog.create({
        data: {
          orderId,
          status: previousStatus,
          notes: notes || `Status reverted to ${previousStatus}`
        }
      });
      
      return NextResponse.json({
        message: `Order ${orderId} status reverted to ${previousStatus}`,
        order: updatedOrder
      });
    } 
    else {
      // Regular status update flow
      if (!status) {
        return NextResponse.json({ error: 'Status is required for regular updates' }, { status: 400 });
      }
      
      // Check if the status transition is valid
      const validTransitions = {
        'PENDING': ['ACCEPTED', 'CANCELLED'],
        'ACCEPTED': ['PREPARING', 'CANCELLED'],
        'PREPARING': ['READY_FOR_PICKUP', 'CANCELLED'],
        'READY_FOR_PICKUP': ['IN_TRANSIT', 'CANCELLED'],
        'IN_TRANSIT': ['DELIVERED', 'CANCELLED'],
        'DELIVERED': [],
        'CANCELLED': []
      };
      
      if (!validTransitions[order.status].includes(status)) {
        return NextResponse.json({ 
          error: `Invalid status transition from ${order.status} to ${status}` 
        }, { status: 400 });
      }
      
      // Update the order status
      const updatedOrder = await prisma.purchasedOrder.update({
        where: { id: orderId },
        data: { status }
      });
      
      // Create a status log entry
      await prisma.orderStatusLog.create({
        data: {
          orderId,
          status,
          notes: notes || null
        }
      });
      
      return NextResponse.json({
        message: `Order ${orderId} status updated to ${status}`,
        order: updatedOrder
      });
    }
    
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
