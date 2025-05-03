import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the order data from the request
    const {
      items,
      deliveryInfo,
      paymentMethod
    } = await req.json();
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }
    
    if (!deliveryInfo || !deliveryInfo.name || !deliveryInfo.address || !deliveryInfo.phone) {
      return NextResponse.json({ error: 'Missing delivery information' }, { status: 400 });
    }
    
    // Get the current user's profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    });
    
    if (!user || !user.profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    // Group items by provider
    const itemsByProvider = {};
    for (const item of items) {
      if (!item.providerId) {
        return NextResponse.json({ error: 'Invalid item data' }, { status: 400 });
      }
      
      if (!itemsByProvider[item.providerId]) {
        itemsByProvider[item.providerId] = [];
      }
      
      itemsByProvider[item.providerId].push(item);
    }
    
    // Start a transaction to ensure data consistency
    const orders = await prisma.$transaction(async (prisma) => {
      const createdOrders = [];
      
      // Process each provider's order
      for (const [providerId, providerItems] of Object.entries(itemsByProvider)) {
        // Get the latest item data and verify availability
        const itemIds = providerItems.map(item => item.id);
        const foodItems = await prisma.foodItem.findMany({
          where: {
            id: { in: itemIds },
            providerId,
            status: 'ACTIVE',
            expiresAt: { gt: new Date() },
            quantity: { gt: 0 }
          }
        });
        
        // Create a map for quick lookup
        const foodItemMap = {};
        for (const item of foodItems) {
          foodItemMap[item.id] = item;
        }
        
        // Verify all items are available
        for (const cartItem of providerItems) {
          const dbItem = foodItemMap[cartItem.id];
          
          if (!dbItem) {
            throw new Error(`Item ${cartItem.id} not found or no longer available`);
          }
          
          if (dbItem.quantity < cartItem.quantity) {
            throw new Error(`Insufficient quantity for ${dbItem.name}`);
          }
        }
        
        // Calculate the total amount
        const deliveryFee = 2500; // IQD
        const serviceFee = 500; // IQD
        
        const subtotal = providerItems.reduce((sum, item) => {
          const dbItem = foodItemMap[item.id];
          return sum + (dbItem.discountedPrice * item.quantity);
        }, 0);
        
        const totalAmount = subtotal + deliveryFee + serviceFee;
        
        // Create the order
        const order = await prisma.purchasedOrder.create({
          data: {
            userProfileId: user.profile.id,
            providerId,
            totalAmount,
            deliveryAddress: deliveryInfo.address,
            deliveryNotes: deliveryInfo.deliveryNotes || null,
            paymentMethod: paymentMethod || 'cash',
            status: 'PENDING',
            // Create order items
            items: {
              create: providerItems.map(item => {
                const dbItem = foodItemMap[item.id];
                return {
                  foodItemId: item.id,
                  quantity: item.quantity,
                  price: dbItem.discountedPrice
                };
              })
            },
            // Create initial status log
            statusLogs: {
              create: {
                status: 'PENDING',
                notes: 'Order placed by customer'
              }
            }
          },
          include: {
            items: {
              include: {
                foodItem: true
              }
            }
          }
        });
        
        // Update inventory for each item
        for (const item of order.items) {
          await prisma.foodItem.update({
            where: { id: item.foodItemId },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          });
        }
        
        createdOrders.push(order);
      }
      
      return createdOrders;
    });
    
    return NextResponse.json({
      success: true,
      message: 'Orders placed successfully',
      orders: orders.map(order => ({
        id: order.id,
        providerId: order.providerId,
        totalAmount: order.totalAmount,
        status: order.status
      }))
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    
    return NextResponse.json({ 
      error: error.message || 'Failed to process order'
    }, { status: 500 });
  }
}
