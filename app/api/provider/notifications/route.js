import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PROVIDER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const providerId = session.user.providerId
    
    // Get the provider's orders as notifications
    const orders = await prisma.purchasedOrder.findMany({
      where: {
        providerId,
      },
      include: {
        userProfile: {
          select: {
            name: true
          }
        },
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Transform orders into notification format
    const notifications = orders.map(order => ({
      id: order.id,
      type: 'ORDER',
      title: `Order #${order.id.substring(0, 8)}`,
      message: `${order.items.length} item(s) - ${order.userProfile.name}`,
      createdAt: order.createdAt,
      viewed: order.viewedByProvider || false,
      data: {
        orderId: order.id,
        status: order.status,
        totalAmount: order.totalAmount
      }
    }))
    
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      viewed: notification.viewed,
      createdAt: notification.createdAt.toISOString(), // Ensure ISO string format
      data: notification.data
    }));

    return NextResponse.json({
      notifications: formattedNotifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Error fetching notifications' }, { status: 500 })
  }
}
