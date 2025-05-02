import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req, { params }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PROVIDER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const providerId = session.user.providerId
    
    // Verify the order belongs to this provider
    const order = await prisma.purchasedOrder.findUnique({
      where: {
        id,
        providerId
      }
    })
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Mark the order as viewed by provider
    await prisma.purchasedOrder.update({
      where: { id },
      data: { viewedByProvider: true }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notification as viewed:', error)
    return NextResponse.json({ error: 'Error marking notification as viewed' }, { status: 500 })
  }
}
