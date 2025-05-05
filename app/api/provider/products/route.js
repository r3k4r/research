import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Fetch provider's food items
export async function GET(request) {
  try {
    // Get authenticated provider session
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Unauthorized. Provider access required." },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search") || "";
    const categoryId = searchParams.get("category") || "";
    const status = searchParams.get("status") || "active"; // Get the status filter
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    // Find provider profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { providerProfile: true },
    });
    
    if (!user?.providerProfile) {
      return NextResponse.json(
        { error: "Provider profile not found" },
        { status: 404 }
      );
    }
    
    const providerId = user.providerProfile.id;
    
    // Build search filters
    const now = new Date(); // Current time for expiration comparison
    
    const where = {
      providerId,
      ...(searchTerm && {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      }),
      ...(categoryId && categoryId !== "all" && { categoryId }),
    };
    
    // Apply expiration status filter - similar to admin implementation
    if (status === "active") {
      where.expiresAt = { gt: now }; // Items that haven't expired
    } else if (status === "expired") {
      where.expiresAt = { lt: now }; // Items that have expired
    }
    // If status is "all", don't add any expiration filter
    
    // Get total count
    const totalItems = await prisma.foodItem.count({ where });
    
    // Fetch food items for this provider
    const foodItems = await prisma.foodItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        category: true,
        provider: {
          select: {
            id: true,
            businessName: true, 
            logo: true
          },
        },
      },
    });
    
    // Fetch all categories (for dropdown)
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    
    // Calculate whether there are more items to fetch
    const hasMore = skip + foodItems.length < totalItems;
    
    return NextResponse.json({
      products: foodItems,
      categories,
      totalItems,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching provider products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create a new food item
export async function POST(request) {
  try {
    // Get authenticated provider session
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Unauthorized. Provider access required." },
        { status: 401 }
      );
    }
    
    // Parse request body
    const data = await request.json();
    const { 
      name, 
      description, 
      originalPrice, 
      discountedPrice, 
      category, 
      quantity, 
      expiresIn, 
      image 
    } = data;
    
    // Validate required fields
    if (!name || !description || !originalPrice || !discountedPrice || !category || !quantity || !expiresIn) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Find provider profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { providerProfile: true },
    });
    
    if (!user?.providerProfile) {
      return NextResponse.json(
        { error: "Provider profile not found" },
        { status: 404 }
      );
    }
    
    const providerId = user.providerProfile.id;
    
    // Find or create the category
    const categoryRecord = await prisma.category.findUnique({
      where: { name: category },
    });
    
    if (!categoryRecord) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Create expiry time
    const now = new Date();
    const expiresAt = new Date(now.getTime() + parseInt(expiresIn) * 60 * 60 * 1000);

    // Create the food item
    const foodItem = await prisma.foodItem.create({
      data: {
        name,
        description,
        price: parseFloat(originalPrice),
        discountedPrice: parseFloat(discountedPrice),
        quantity: parseInt(quantity),
        categoryId: categoryRecord.id,
        providerId,
        image: image || null,
        expiresAt,
      },
    });
    
    return NextResponse.json(foodItem);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
