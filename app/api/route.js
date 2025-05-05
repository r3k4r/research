import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoryIds = searchParams.getAll('category') || [];
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '1000');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;
    
    
    const now = new Date();
    
    try {
      await prisma.foodItem.updateMany({
        where: {
          expiresAt: { lt: now },
          status: 'ACTIVE',
        },
        data: {
          status: 'EXPIRED'
        }
      });
      
    } catch (updateError) {
      throw new Error('Failed to update expired food items');
    }
    
    const where = {
      expiresAt: { gt: now },
      status: 'ACTIVE',
      quantity: { gt: 0 },
      discountedPrice: {
        gte: minPrice,
        lte: maxPrice
      }
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { provider: { businessName: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    }
    
    
    try {
      const [totalItems, foodItems, categories, priceStats] = await Promise.all([
        prisma.foodItem.count({ where }),
        
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
            { expiresAt: 'asc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        }),
        
        prisma.category.findMany({
          orderBy: { name: 'asc' },
          select: { id: true, name: true }
        }),
        
        prisma.foodItem.aggregate({
          where: { 
            expiresAt: { gt: now },
            status: 'ACTIVE',
            quantity: { gt: 0 }  
          },
          _min: { discountedPrice: true },
          _max: { discountedPrice: true }
        })
      ]);
      
      
      const minAvailablePrice = priceStats._min.discountedPrice || 0;
      const maxAvailablePrice = priceStats._max.discountedPrice || 100;
      
      const hasMore = totalItems > skip + foodItems.length;
      
      
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
      throw dbError;
    }
  } catch (error) {
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
