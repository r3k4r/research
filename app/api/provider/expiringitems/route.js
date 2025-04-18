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

    // Parse filters from query parameters
    const url = new URL(req.url);
    const filterType = url.searchParams.get('filter') || 'all'; // all, expired, expiring-soon
    
    // Define where clause based on filter type
    let whereClause = {
      providerId: providerId,
      quantity: {
        gt: 0
      }
    };
    
    if (filterType === 'expired') {
      whereClause.expiresAt = {
        lt: now
      };
    } else if (filterType === 'expiring-soon') {
      whereClause.expiresAt = {
        gte: now,
        lte: threeDaysFromNow
      };
    } else {
      // For 'all', include both expired and expiring soon
      whereClause.expiresAt = {
        lte: threeDaysFromNow
      };
    }
    
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
    const formattedItems = expiringItems.map(item => ({
      id: item.id,
      name: item.name,
      image: item.image || '/images/placeholder-food.jpg',
      currentPrice: item.discountedPrice,
      originalPrice: item.price,
      quantity: item.quantity,
      expiresAt: item.expiresAt.toISOString(),
      category: item.category.name,
      isExpired: item.expiresAt < now
    }));
    
    return NextResponse.json(formattedItems);
    
  } catch (error) {
    console.error('Error fetching expiring items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST handler for increasing discount
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
      case 'increaseDiscount': {
        // Increase discount by 10% (or custom percentage)
        const discountPercentage = data.percentage || 10;
        const newDiscountedPrice = Math.max(
          foodItem.price * (1 - (discountPercentage / 100)),
          0.01 // Minimum price
        );
        
        const updatedItem = await prisma.foodItem.update({
          where: { id: data.itemId },
          data: {
            discountedPrice: parseFloat(newDiscountedPrice.toFixed(2))
          }
        });
        
        return NextResponse.json({
          message: 'Discount increased successfully',
          item: updatedItem
        });
      }
      
      case 'markAsSold': {
        // Mark item as sold by setting quantity to 0
        const updatedItem = await prisma.foodItem.update({
          where: { id: data.itemId },
          data: {
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
