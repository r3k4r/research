import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req) {
  try {
    const { items } = await req.json();
    
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid cart data',
        valid: false 
      }, { status: 400 });
    }
    
    // Fetch all food items from the database to validate
    const itemIds = items.map(item => item.id);
    const foodItems = await prisma.foodItem.findMany({
      where: {
        id: { in: itemIds },
        status: 'ACTIVE', // Only active items
        expiresAt: { gt: new Date() }, // Not expired
        quantity: { gt: 0 } // Still in stock
      },
      include: {
        provider: {
          select: { id: true, businessName: true }
        }
      }
    });
    
    // Map items by ID for easy lookup
    const foodItemMap = foodItems.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
    
    // Validate each item in the cart
    const validationResults = items.map(cartItem => {
      const dbItem = foodItemMap[cartItem.id];
      
      // Check if item exists and is valid
      if (!dbItem) {
        return {
          id: cartItem.id,
          valid: false,
          message: 'Item not found or no longer available',
          remove: true
        };
      }
      
      // Check quantity
      if (dbItem.quantity < cartItem.quantity) {
        return {
          id: cartItem.id,
          valid: false,
          message: `Only ${dbItem.quantity} item(s) available`,
          actualQuantity: dbItem.quantity,
          adjust: true
        };
      }
      
      // Check price changes
      if (dbItem.discountedPrice !== cartItem.price) {
        return {
          id: cartItem.id,
          valid: false,
          message: 'Price has changed',
          actualPrice: dbItem.discountedPrice,
          adjust: true
        };
      }
      
      // Return updated item with fresh data
      return {
        id: cartItem.id,
        valid: true,
        name: dbItem.name,
        price: dbItem.discountedPrice,
        originalPrice: dbItem.price,
        provider: dbItem.provider.businessName,
        providerId: dbItem.provider.id,
        image: dbItem.image,
        quantity: cartItem.quantity,
        availableQuantity: dbItem.quantity
      };
    });
    
    const allValid = validationResults.every(result => result.valid);
    
    return NextResponse.json({
      valid: allValid,
      items: validationResults,
      message: allValid ? 'Cart is valid' : 'Some items in your cart need attention'
    });
    
  } catch (error) {
    console.error('Error validating cart:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      valid: false 
    }, { status: 500 });
  }
}
