import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        userProfile: true,
        foodItem: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      userId: review.userProfileId,
      userName: review.userProfile?.name ,
      foodItemId: review.foodItemId,
      foodItemName: review.foodItem?.name ,
      rating: review.rating,
      comment: review.comment,
      type: review.type,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    }));
    
    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const reviewId = url.pathname.split('/').pop();
    
    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
