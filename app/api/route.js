import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET endpoint for fetching food items with filtering, search and pagination
export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoryIds = searchParams.getAll('category') || [];
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '1000');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;
    
    console.log(`API request - Page: ${page}, Skip: ${skip}, Limit: ${limit}, Categories: ${categoryIds.join(',')}`);
    
    // Get current date to filter out expired items
    const now = new Date();
    
    // Build the where clause for the query
    const where = {
      // Only return active items that haven't expired
      expiresAt: { gt: now },
      status: 'ACTIVE',
      // Filter by price range
      discountedPrice: {
        gte: minPrice,
        lte: maxPrice
      }
    };
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { provider: { businessName: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    // Add category filter if provided
    if (categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    }
    
    console.log('Query where clause:', JSON.stringify(where, null, 2));
    
    try {
      // Perform queries in parallel for better performance
      const [totalItems, foodItems, categories, priceStats] = await Promise.all([
        // Get total count of matching items
        prisma.foodItem.count({ where }),
        
        // Fetch food items
        prisma.foodItem.findMany({
          where,
          include: {
            provider: {
              select: {
                id: true,
                businessName: true,
                logo: true
              }
            },
            category: true
          },
          orderBy: [
            // Sort by soon expiring first and recently added
            { expiresAt: 'asc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        }),
        
        // Fetch all categories for the filter dropdown
        prisma.category.findMany({
          orderBy: { name: 'asc' },
          select: { id: true, name: true }
        }),
        
        // Calculate min/max prices for the price range filter
        prisma.foodItem.aggregate({
          where: { 
            expiresAt: { gt: now },
            status: 'ACTIVE'
          },
          _min: { discountedPrice: true },
          _max: { discountedPrice: true }
        })
      ]);
      
      console.log(`API fetch success - Retrieved ${foodItems.length} items`);
      
      const minAvailablePrice = priceStats._min.discountedPrice || 0;
      const maxAvailablePrice = priceStats._max.discountedPrice || 100;
      
      // Determine if there are more items to load
      const hasMore = totalItems > skip + foodItems.length;
      
      console.log(`API response - Items: ${foodItems.length}, Total: ${totalItems}, HasMore: ${hasMore}`);
      
      return NextResponse.json({
        foodItems,
        categories,
        priceRange: {
          min: minAvailablePrice,
          max: maxAvailablePrice
        },
        pagination: {
          page,
          limit,
          totalItems,
          hasMore
        }
      });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Error fetching food items:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch food items',
        message: error.message,
        foodItems: [],
        categories: [],
        priceRange: { min: 0, max: 100 },
        pagination: { page: 1, limit: 12, totalItems: 0, hasMore: false }
      },
      { status: 500 }
    );
  }
}
