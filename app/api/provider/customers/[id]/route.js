import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req, { params }) {
  const id = params.id;
  
  try {
    // Get the current provider's session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find the provider profile for the current logged-in user
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });
    
    if (!providerProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found' }, 
        { status: 404 }
      );
    }
    
    // Get the customer's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        location: true,
        phoneNumber: true,
        gender: true,
        image: true,
        user: {
          select: {
            email: true,
            createdAt: true
          }
        }
      }
    });
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'Customer not found' }, 
        { status: 404 }
      );
    }
    
    // Get orders from this customer to the current provider
    const orders = await prisma.purchasedOrder.findMany({
      where: {
        userProfileId: id,
        providerId: providerProfile.id
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true,
        deliveryAddress: true,
        deliveryNotes: true,
        paymentMethod: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            foodItem: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });
    
    // Calculate total spent
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Format the order items
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.foodItem.name,
        description: item.foodItem.description,
        foodItemId: item.foodItem.id
      }))
    }));
    
    // Construct the response
    const customerData = {
      customer: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.user.email,
        location: userProfile.location || 'Not provided',
        phoneNumber: userProfile.phoneNumber || 'Not provided',
        gender: userProfile.gender,
        image: userProfile.image,
        joinedAt: userProfile.user.createdAt,
        totalOrders: orders.length,
        totalSpent,
        lastOrderDate: orders.length > 0 ? orders[0].createdAt : null
      },
      orders: formattedOrders
    };
    
    return NextResponse.json(customerData);
    
  } catch (error) {
    console.error('Error fetching customer details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer details' }, 
      { status: 500 }
    );
  }
}