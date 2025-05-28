import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    
    // Build the where clause
    let where = {
      foodItem: {
        providerId: providerId
      }
    };
    
    if (searchTerm) {
      where.OR = [
        { comment: { contains: searchTerm, mode: 'insensitive' } },
        { userProfile: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { foodItem: { name: { contains: searchTerm, mode: 'insensitive' } } }
      ];
    }
    
    // Fetch reviews for this provider's food items
    const reviews = await prisma.review.findMany({
      where,
      include: {
        userProfile: true,
        foodItem: true,
        order: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Format the reviews for the frontend
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      userId: review.userProfileId,
      userName: review.userProfile?.name || 'Anonymous',
      foodItemId: review.foodItemId,
      foodItemName: review.foodItem?.name || 'Unknown Item',
      rating: review.rating,
      comment: review.comment,
      type: review.type,
      orderId: review.orderId,
      orderStatus: review.order?.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    }));
    
    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching provider reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
