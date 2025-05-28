import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    // Get authenticated provider session
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'PROVIDER') {
      return NextResponse.json(
        { error: 'Unauthorized. Provider access required.' },
        { status: 401 }
      );
    }
    
    // Find provider profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { providerProfile: true },
    });
    
    if (!user?.providerProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }
    
    const providerId = user.providerProfile.id;
    const { id } = params;
    
    // Fetch the specific review
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
    
    // Ensure the review belongs to this provider
    if (review.foodItem.providerId !== providerId) {
      return NextResponse.json(
        { error: 'Access denied. This review is not for your food item.' },
        { status: 403 }
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
