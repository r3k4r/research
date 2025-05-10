import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET handler for fetching provider orders
export async function GET(req) {
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
      console.error('Provider profile not found for user:', session.user.email);
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }
    
    const providerId = user.providerProfile.id;
    
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    
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
    

    const formattedOrders = orders.map(order => {
      const deliveryFee = 2500; 
      const serviceFee = 500;   
      
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const total = subtotal + deliveryFee + serviceFee;

      const estimatedTime = order.estimatedDelivery ? 
        new Date(order.estimatedDelivery).getTime() : null;
      
      return {
        id: order.id,
        customerName: order.customerName || order.userProfile.name,
        date: order.createdAt.toISOString(),
        status: order.status,
        subtotal, 
        deliveryFee, 
        serviceFee, 
        totalAmount: total,
        estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toISOString() : null,
        estimatedMinutes: estimatedTime ? 
          Math.max(0, Math.floor((estimatedTime - Date.now()) / (1000 * 60))) : null,
        items: order.items.map(item => ({
          name: item.foodItem.name,
          quantity: item.quantity,
          price: item.price
        })),
        address: order.deliveryAddress,
        phone: order.customerPhone || order.userProfile.phoneNumber || 'Not provided', 
        specialRequests: order.deliveryNotes || '',
        statusLogs: order.statusLogs.map(log => ({
          status: log.status,
          notes: log.notes,
          date: log.createdAt.toISOString()
        }))
      };
    });
    
    return NextResponse.json(formattedOrders);
    
  } catch (error) {
    console.error('Error in provider orders API:', error);
    
    let errorMessage = 'Failed to fetch orders';
    let statusCode = 500;
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code);
      
      if (error.code === 'P2009') {
        errorMessage = 'Invalid data provided: ' + error.message.split('\n').pop();
      } else if (error.code === 'P2003') {
        errorMessage = 'Related record not found';
      }
    }
    
    if (error.message && error.message.includes("not found in enum")) {
      errorMessage = "Invalid status value provided. Please check your database schema.";
      statusCode = 400;
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      message: error.message,
      type: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: statusCode });
  }
}

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
    const { orderId, status, notes, action, estimatedMinutes } = data;
    
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
      // Updated to allow transitions from PENDING to ACCEPTED first
      const validTransitions = {
        'PENDING': ['ACCEPTED', 'CANCELLED'],
        'ACCEPTED': ['PREPARING', 'CANCELLED'],
        'PREPARING': ['READY_FOR_PICKUP', 'CANCELLED'],
        'READY_FOR_PICKUP': ['IN_TRANSIT', 'CANCELLED'],
        'IN_TRANSIT': ['DELIVERED', 'CANCELLED'],
        'DELIVERED': ['CANCELLED'], // Allow reverting from DELIVERED to CANCELLED
        'CANCELLED': ['PENDING', 'ACCEPTED'] // Allow restoring cancelled orders
      };
      
      if (!validTransitions[order.status].includes(status)) {
        return NextResponse.json({ 
          error: `Invalid status transition from ${order.status} to ${status}` 
        }, { status: 400 });
      }
      
      // Calculate estimated delivery time if accepting the order
      let updateData = { status };
      
      // If this is an ACCEPTED status and estimatedMinutes is provided, set the estimated delivery time
      if (status === 'ACCEPTED' && estimatedMinutes && !isNaN(estimatedMinutes)) {
        const minutes = parseInt(estimatedMinutes, 10);
        if (minutes > 0) {
          const estimatedDelivery = new Date();
          estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + minutes);
          updateData.estimatedDelivery = estimatedDelivery;
          
          // Add a note about estimated time in the status log
          notes = notes || `Estimated delivery time: ${minutes} minutes`;
        }
      }
      
      // Update the order status
      const updatedOrder = await prisma.purchasedOrder.update({
        where: { id: orderId },
        data: updateData
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
