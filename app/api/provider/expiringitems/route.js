import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET handler for fetching expiring items
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
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
    
    // Get date for one hour from now
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Parse filters from query parameters
    const url = new URL(req.url);
    const filterType = url.searchParams.get('filter') || 'all'; // all, expired, expiring-soon
    
    // Define where clause based on filter type, keeping it simple
    let whereClause = {
      providerId: providerId,
      status: { not: 'SOLD' } // Don't show items that are already sold
    };
    
    if (filterType === 'expired') {
      // Items that have already expired 
      whereClause.expiresAt = {
        lt: now
      };
    } else if (filterType === 'expiring-soon') {
      // Items that will expire within the next hour (now <= expiresAt < now + 1 hour)
      whereClause.expiresAt = {
        gte: now,
        lt: oneHourFromNow
      };
    }
    // For 'all', we don't add any date filter - show all items
    
    // Find items that match the filter criteria
    const expiringItems = await prisma.foodItem.findMany({
      where: whereClause,
      include: {
        category: true
      },
      orderBy: {
        expiresAt: 'asc'
      }
    });
    
    
    // Format the items for the frontend
    const formattedItems = expiringItems.map(item => {
      const isExpired = new Date(item.expiresAt) < now;
      
      // For expired items, update their status to EXPIRED if not already
      if (isExpired && item.status === 'ACTIVE') {
        prisma.foodItem.update({
          where: { id: item.id },
          data: { status: 'EXPIRED' }
        }).catch(err => console.error('Error updating expired item status:', err));
      }
      
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image || '/images/placeholder-food.jpg',
        currentPrice: item.discountedPrice,
        originalPrice: item.price,
        quantity: item.quantity,
        expiresAt: item.expiresAt.toISOString(),
        category: item.category.name,
        categoryId: item.categoryId,
        status: item.status,
        isExpired: isExpired
      };
    });
    
    return NextResponse.json(formattedItems);
    
  } catch (error) {
    console.error('Error fetching expiring items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST handler for increasing discount and marking as sold
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { providerProfile: true }
    });
    
    if (!user || !user.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }
    
    const providerId = user.providerProfile.id;
    const data = await req.json();
    
    // Validate request data
    if (!data.itemId || !data.action) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    
    // Get the food item and verify ownership
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: data.itemId }
    });
    
    if (!foodItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    if (foodItem.providerId !== providerId) {
      return NextResponse.json({ error: 'You do not own this item' }, { status: 403 });
    }
    
    // Process based on action type
    switch (data.action) {
      case 'updatePrice': {
        // Update the price with the new values
        const originalPrice = parseFloat(data.originalPrice);
        const discountedPrice = parseFloat(data.discountedPrice);
        
        if (isNaN(originalPrice) || isNaN(discountedPrice)) {
          return NextResponse.json({ error: 'Invalid price values' }, { status: 400 });
        }
        
        if (discountedPrice > originalPrice) {
          return NextResponse.json({ error: 'Discounted price cannot be higher than original price' }, { status: 400 });
        }
        
        const updatedItem = await prisma.foodItem.update({
          where: { id: data.itemId },
          data: {
            price: originalPrice,
            discountedPrice: discountedPrice
          }
        });
        
        return NextResponse.json({
          message: 'Prices updated successfully',
          item: updatedItem
        });
      }
      
      case 'markAsSold': {
        // Mark item as sold by setting its status to SOLD
        const updatedItem = await prisma.foodItem.update({
          where: { id: data.itemId },
          data: {
            status: 'SOLD',
            quantity: 0
          }
        });
        
        return NextResponse.json({
          message: 'Item marked as sold',
          item: updatedItem
        });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error processing item action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE handler for removing items
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { providerProfile: true }
    });
    
    if (!user || !user.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }
    
    const providerId = user.providerProfile.id;
    
    // Get item ID from URL
    const url = new URL(req.url);
    const itemId = url.searchParams.get('itemId');
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }
    
    // Get the food item and verify ownership
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: itemId }
    });
    
    if (!foodItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    if (foodItem.providerId !== providerId) {
      return NextResponse.json({ error: 'You do not own this item' }, { status: 403 });
    }
    
    // Delete the food item
    await prisma.foodItem.delete({
      where: { id: itemId }
    });
    
    return NextResponse.json({
      message: 'Item deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH handler for editing items
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { providerProfile: true }
    });
    
    if (!user || !user.providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }
    
    const providerId = user.providerProfile.id;
    const data = await req.json();
    
    // Validate request data
    if (!data.itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }
    
    // Get the food item and verify ownership
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: data.itemId }
    });
    
    if (!foodItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    if (foodItem.providerId !== providerId) {
      return NextResponse.json({ error: 'You do not own this item' }, { status: 403 });
    }
    
    // Update fields that are provided in the request
    const updateData = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.discountedPrice !== undefined) updateData.discountedPrice = parseFloat(data.discountedPrice);
    if (data.quantity !== undefined) updateData.quantity = parseInt(data.quantity, 10);
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.expiresAt !== undefined) updateData.expiresAt = new Date(data.expiresAt);
    if (data.image !== undefined) updateData.image = data.image;
    
    const updatedItem = await prisma.foodItem.update({
      where: { id: data.itemId },
      data: updateData
    });
    
    return NextResponse.json({
      message: 'Item updated successfully',
      item: updatedItem
    });
    
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
