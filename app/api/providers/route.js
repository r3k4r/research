import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    
    // Calculate pagination offset
    const skip = (page - 1) * limit;
    
    // Build the where clause for search functionality
    let where = {};
    
    if (search) {
      where.OR = [
        { 
          name: {
            contains: search,
            mode: 'insensitive'
          } 
        },
        { 
          businessName: {
            contains: search,
            mode: 'insensitive'
          } 
        },
        { 
          address: {
            contains: search,
            mode: 'insensitive'
          } 
        }
      ];
    }
    
    // Execute both queries concurrently for better performance
    const [totalProviders, providers] = await Promise.all([
      prisma.providerProfile.count({ where }),
      prisma.providerProfile.findMany({
        where,
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
        },
        orderBy: [
          { businessName: 'asc' }
        ],
        skip,
        take: limit
      })
    ]);
    
    // Calculate if there are more results
    const hasMore = totalProviders > skip + providers.length;
    
    // Format the response
    return NextResponse.json({
      providers,
      pagination: {
        page,
        limit,
        totalProviders,
        hasMore
      }
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch providers',
        message: error.message,
        providers: [],
        pagination: { 
          page: 1, 
          limit: 20, 
          totalProviders: 0, 
          hasMore: false 
        }
      },
      { status: 500 }
    );
  }
}
