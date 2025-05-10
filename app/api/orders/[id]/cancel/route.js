import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const orderId = params.id;
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    });
    
    if (!user || !user.profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    // Find the order and ensure it belongs to the user
    const order = await prisma.purchasedOrder.findUnique({
      where: { id: orderId },
      include: { items: true }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    if (order.userProfileId !== user.profile.id) {
      return NextResponse.json({ error: 'You do not own this order' }, { status: 403 });
    }
    
    // Check if the order can be cancelled (only PENDING orders can be cancelled by users)
    if (order.status !== 'PENDING') {
      return NextResponse.json({
        error: 'Only pending orders can be cancelled'
      }, { status: 400 });
    }
    
    // Use a transaction to ensure all operations complete or none do
    await prisma.$transaction(async (prisma) => {
      // Update order status to CANCELLED
      await prisma.purchasedOrder.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      });
      
      // Add a status log entry
      await prisma.orderStatusLog.create({
        data: {
          orderId,
          status: 'CANCELLED',
          notes: 'Cancelled by customer'
        }
      });
      
      // Return the items to inventory and restore status if needed
      for (const item of order.items) {
        const foodItem = await prisma.foodItem.findUnique({
          where: { id: item.foodItemId }
        });
        
        if (foodItem) {
          // Update quantity and reactivate if it was marked as SOLD
          await prisma.foodItem.update({
            where: { id: item.foodItemId },
            data: {
              quantity: {
                increment: item.quantity
              },
              // If item was marked as SOLD and not expired, make it ACTIVE again
              ...(foodItem.status === 'SOLD' && foodItem.expiresAt > new Date() ? 
                { status: 'ACTIVE' } : {})
            }
          });
        }
      }
    });
    
    return NextResponse.json({
      message: 'Order cancelled successfully'
    });
    
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}
