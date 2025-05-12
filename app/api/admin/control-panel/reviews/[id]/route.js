import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        userProfile: true,
        foodItem: {
          include: {
            category: true,
            provider: true
          }
        },
        order: {
          include: {
            statusLogs: {
              orderBy: { createdAt: 'asc' }
            },
            items: {
              include: {
                foodItem: true
              }
            }
          }
        }
      }
    });
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Format the review data for the frontend
    const formattedReview = {
      id: review.id,
      user: {
        id: review.userProfile.id,
        name: review.userProfile.name,
        location: review.userProfile.location,
        phoneNumber: review.userProfile.phoneNumber,
        gender: review.userProfile.gender,
        image: review.userProfile.image
      },
      foodItem: {
        id: review.foodItem.id,
        name: review.foodItem.name,
        description: review.foodItem.description,
        price: review.foodItem.price,
        discountedPrice: review.foodItem.discountedPrice,
        category: review.foodItem.category.name,
        image: review.foodItem.image,
        provider: {
          id: review.foodItem.provider.id,
          name: review.foodItem.provider.name,
          businessName: review.foodItem.provider.businessName,
          description: review.foodItem.provider.description,
          address: review.foodItem.provider.address,
          phoneNumber: review.foodItem.provider.phoneNumber
        }
      },
      rating: review.rating,
      comment: review.comment,
      type: review.type,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      order: review.order ? {
        id: review.order.id,
        status: review.order.status,
        totalAmount: review.order.totalAmount,
        deliveryAddress: review.order.deliveryAddress,
        deliveryNotes: review.order.deliveryNotes,
        customerName: review.order.customerName,
        customerPhone: review.order.customerPhone,
        paymentMethod: review.order.paymentMethod,
        deliveryPersonName: review.order.deliveryPersonName,
        estimatedDelivery: review.order.estimatedDelivery,
        createdAt: review.order.createdAt,
        statusLogs: review.order.statusLogs
      } : null
    };
    
    return NextResponse.json(formattedReview);
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    await prisma.review.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    
    // Handle Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
