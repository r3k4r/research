import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth'; 

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { foodItemId, orderId, rating, type, comment } = await req.json();
    
    // Validate required fields
    if (!foodItemId || !type || rating === undefined || rating === null) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }
    
    if (rating < 0 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 0 and 5' }, { status: 400 });
    }
    
    // Get user profile ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    });
    
    if (!user || !user.profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    // Check if the order belongs to the user and is delivered
    if (orderId) {
      const order = await prisma.purchasedOrder.findUnique({
        where: { id: orderId },
        select: { 
          userProfileId: true, 
          status: true, 
          isReviewed: true,
          items: {
            select: {
              id: true,
              foodItemId: true
            }
          }
        }
      });
      
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      
      if (order.userProfileId !== user.profile.id) {
        return NextResponse.json({ error: 'You can only review your own orders' }, { status: 403 });
      }
      
      if (order.status !== 'DELIVERED') {
        return NextResponse.json({ 
          error: 'You can only review orders that have been delivered' 
        }, { status: 400 });
      }
      
      const orderHasItem = order.items.some(item => 
        item.foodItemId === foodItemId || item.id === foodItemId
      );
      
      if (!orderHasItem) {
        return NextResponse.json({ 
          error: 'The food item does not belong to this order',
          requestedItemId: foodItemId,
          availableItems: order.items
        }, { status: 400 });
      }
    }
    
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: foodItemId }
    });
    
    if (!foodItem) {
      return NextResponse.json({ error: 'Food item not found' }, { status: 404 });
    }
    
    // Create the review
    const review = await prisma.review.create({
      data: {
        userProfileId: user.profile.id,
        foodItemId,
        rating,
        type,
        comment,
        orderId
      }
    });
    
    // Update the order to mark it as reviewed
    if (orderId) {
      await prisma.purchasedOrder.update({
        where: { id: orderId },
        data: { isReviewed: true }
      });
    }
    
    // Calculate average rating for provider items - THIS IS OPTIONAL
    try {
      const providerItems = await prisma.foodItem.findMany({
        where: {
          providerId: foodItem.providerId
        },
        select: {
          id: true
        }
      });
      
      const itemIds = providerItems.map(item => item.id);
      
      const avgRating = await prisma.review.aggregate({
        where: {
          foodItemId: {
            in: itemIds
          }
        },
        _avg: {
          rating: true
        }
      });
      
      // Only try to update if rating field exists in schema
      if (avgRating._avg.rating) {
        // Check if the field exists in the schema before updating
        const providerFields = await prisma.$queryRaw`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'ProviderProfile'
        `;
        
        const fieldNames = providerFields.map(f => f.column_name.toLowerCase());
        
        // Only update if the field exists
        if (fieldNames.includes('rating')) {
          await prisma.providerProfile.update({
            where: { id: foodItem.providerId },
            data: {
              rating: avgRating._avg.rating  // Fixed typo: "raiting" -> "rating"
            }
          });
        }
      }
    } catch (avgError) {
      // Log the error but don't fail the review submission
      console.error('Error updating provider rating:', avgError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        id: review.id,
        rating: review.rating,
        type: review.type
      }
    });
    
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review', details: error.message }, 
      { status: 500 }
    );
  }
}
