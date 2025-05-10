import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Get food items with search and filtering
export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category');
  const status = searchParams.get('status') || 'active'; 
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const skip = (page - 1) * limit;
  
  
  try {
    const where = {};
    const now = new Date();
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { provider: { businessName: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }
    
    if (status === 'active') {
      where.expiresAt = { gt: now };
    } else if (status === 'expired') {
      where.expiresAt = { lt: now };
    }
    
    const totalItems = await prisma.foodItem.count({ where });
    
    const foodItems = await prisma.foodItem.findMany({
      where,
      include: {
        provider: true,
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });
    
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    const hasMore = skip + foodItems.length < totalItems;
    
    
    return NextResponse.json({
      foodItems,
      categories,
      totalItems,
      hasMore
    });
  } catch (error) {
    console.error("Error fetching food items:", error);
    return NextResponse.json(
      { error: "Failed to fetch food items" }, 
      { status: 500 }
    );
  }
}

// Create a new food item
export async function POST(request) {
  try {
    const body = await request.json();
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(body.expiresIn));
    
    const categoryName = body.category?.trim();
    if (!categoryName) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }
    
    let category = await prisma.category.findFirst({
      where: { 
        name: { 
          equals: categoryName,
          mode: 'insensitive'
        }
      }
    });
    
    if (!category) {
      try {
        category = await prisma.category.create({
          data: { name: categoryName }
        });
      } catch (categoryError) {
        console.error("Error creating category:", categoryError);
        return NextResponse.json(
          { error: "Failed to create category", details: categoryError.message },
          { status: 500 }
        );
      }
    }
    
    // Create the food item with the category ID
    const newItem = await prisma.foodItem.create({
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.originalPrice),
        discountedPrice: parseFloat(body.discountedPrice),
        quantity: parseInt(body.quantity || 1),
        image: body.image || "/default-food.jpg",
        categoryId: category.id, 
        providerId: body.providerId,
        expiresAt: expiresAt
      },
      include: {
        provider: true,
        category: true
      }
    });
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating food item:", error);
    return NextResponse.json(
      { error: "Failed to create food item", details: error.message }, 
      { status: 500 }
    );
  }
}
