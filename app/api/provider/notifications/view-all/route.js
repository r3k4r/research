import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get provider ID from user profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { providerProfile: true }
    });
    
    if (!user || !user.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }
    
    const providerId = user.providerProfile.id;
    
    // Mark all orders as viewed by provider
    const result = await prisma.purchasedOrder.updateMany({
      where: {
        providerId,
        viewedByProvider: false
      },
      data: {
        viewedByProvider: true
      }
    });
    
    return NextResponse.json({ 
      success: true,
      message: `Marked ${result.count} notifications as viewed`
    });
  } catch (error) {
    console.error('Error marking all notifications as viewed:', error);
    return NextResponse.json({ 
      error: 'Error marking all notifications as viewed',
      details: error.message
    }, { status: 500 });
  }
}
