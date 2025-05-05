import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    
    // For provider's food items pagination and filtering
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('category') || '';
    
    // Pagination offset
    const skip = (page - 1) * limit;
    
    // Get current date for expiration checks
    const now = new Date();
    
    // Find provider with basic details
    const provider = await prisma.providerProfile.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        businessName: true,
        description: true,
        address: true,
        phoneNumber: true,
        businessHours: true,
        logo: true,
        user: {
          select: {
            email: true,
            createdAt: true
          }
        }
      }
    });
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }
    
    // Build where clause for food items
    let foodItemsWhere = {
      providerId: id,
      status: 'ACTIVE',
      expiresAt: { gt: now },
      quantity: { gt: 0 }
    };
    
    // Add search functionality
    if (search) {
      foodItemsWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Add category filter
    if (categoryId) {
      foodItemsWhere.categoryId = categoryId;
    }
    
    // Get food items, total count and categories in parallel
    const [foodItems, totalItems, categories] = await Promise.all([
      // Get food items with pagination
      prisma.foodItem.findMany({
        where: foodItemsWhere,
        include: {
          category: true
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      
      // Get total items count for pagination
      prisma.foodItem.count({
        where: foodItemsWhere
      }),
      
      // Get categories for filter dropdown
      prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
      })
    ]);
    
    // Additional provider stats for showing at the top
    const stats = await prisma.foodItem.aggregate({
      where: {
        providerId: id,
        status: 'ACTIVE',
        expiresAt: { gt: now }
      },
      _count: true,
      _avg: {
        discountedPrice: true
      },
      _min: {
        discountedPrice: true
      },
      _max: {
        discountedPrice: true
      }
    });
    
    // Format response
    return NextResponse.json({
      provider: {
        ...provider,
        joinedDate: provider.user.createdAt,
        stats: {
          totalActiveItems: stats._count || 0,
          avgPrice: stats._avg?.discountedPrice ? parseFloat(stats._avg.discountedPrice.toFixed(2)) : 0,
          minPrice: stats._min?.discountedPrice || 0,
          maxPrice: stats._max?.discountedPrice || 0
        }
      },
      foodItems,
      categories,
      pagination: {
        page,
        limit,
        totalItems,
        hasMore: totalItems > skip + foodItems.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider details' },
      { status: 500 }
    );
  }
}
