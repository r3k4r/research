import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PROVIDER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const providerId = session.user.providerId
    
    // Mark all orders as viewed by provider
    await prisma.purchasedOrder.updateMany({
      where: {
        providerId,
        viewedByProvider: false
      },
      data: {
        viewedByProvider: true
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking all notifications as viewed:', error)
    return NextResponse.json({ error: 'Error marking all notifications as viewed' }, { status: 500 })
  }
}
