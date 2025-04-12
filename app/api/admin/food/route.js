import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Get food items with search and filtering
export async function GET(request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const categoryId = url.searchParams.get("category") || "";

  try {
    // Build where clause for filtering and search
    const where = {};
    
    // Add search condition
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { provider: { businessName: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    // Add category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // Fetch food items
    const foodItems = await prisma.foodItem.findMany({
      where,
      include: {
        provider: {
          select: {
            businessName: true,
            logo: true
          }
        },
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Get all categories for the filter dropdown
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json({ 
      foodItems, 
      categories,
      totalItems: foodItems.length
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
    
    // Find or create the category
    let category = await prisma.category.findFirst({
      where: { name: body.category }
    });
    
    if (!category) {
      category = await prisma.category.create({
        data: { name: body.category }
      });
    }
    
    // Create the food item
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
      { error: "Failed to create food item" }, 
      { status: 500 }
    );
  }
}
