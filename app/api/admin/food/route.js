import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Get food items with search and filtering
export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category');
  const status = searchParams.get('status') || 'active'; // Get status param with default 'active'
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const skip = (page - 1) * limit;
  
  console.log(`Admin food request - Page: ${page}, Skip: ${skip}, Limit: ${limit}, Status: ${status}`);
  
  try {
    // Build filter conditions
    const where = {};
    const now = new Date(); // Get current time for expiration filtering
    
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
    
    // Add expiration filter based on status
    if (status === 'active') {
      where.expiresAt = { gt: now };
    } else if (status === 'expired') {
      where.expiresAt = { lt: now };
    }
    
    // Get total count for pagination
    const totalItems = await prisma.foodItem.count({ where });
    
    // Fetch paginated food items with filter
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
    
    // Fetch all categories for the dropdown
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    // Calculate whether there are more items to fetch
    const hasMore = skip + foodItems.length < totalItems;
    
    console.log(`Admin food response - Retrieved: ${foodItems.length}, Total: ${totalItems}, HasMore: ${hasMore}`);
    
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
    
    // Calculate expiry date from expiresIn hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(body.expiresIn));
    
    // Ensure we have a category name
    const categoryName = body.category?.trim();
    if (!categoryName) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }
    
    // First check if this is a new category that needs to be created
    let category = await prisma.category.findFirst({
      where: { 
        name: { 
          equals: categoryName,
          mode: 'insensitive'
        }
      }
    });
    
    // If category doesn't exist, create it in the Category table
    if (!category) {
      try {
        console.log(`Creating new category: ${categoryName}`);
        category = await prisma.category.create({
          data: { name: categoryName }
        });
        console.log("New category created:", category);
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
        categoryId: category.id,  // Use the Category table ID
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
