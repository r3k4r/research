import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    
    // Get current date
    const now = new Date();
    
    // Get date for 3 days from now (items expiring within 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // Find items that will expire soon
    const expiringItems = await prisma.foodItem.findMany({
      where: {
        providerId: providerId,
        expiresAt: {
          gte: now,
          lte: threeDaysFromNow
        },
        quantity: {
          gt: 0
        }
      },
      include: {
        category: true
      },
      orderBy: {
        expiresAt: 'asc'
      }
    });
    
    // Format the items for the frontend
    const formattedItems = expiringItems.map(item => ({
      id: item.id,
      name: item.name,
      image: item.image || '/images/placeholder-food.jpg',
      currentPrice: item.discountedPrice,
      originalPrice: item.price,
      quantity: item.quantity,
      expiresAt: item.expiresAt.toISOString(),
      category: item.category.name
    }));
    
    return NextResponse.json(formattedItems);
    
  } catch (error) {
    console.error('Error fetching expiring items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
