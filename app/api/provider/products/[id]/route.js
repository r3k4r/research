import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";


// Helper function to verify product ownership
async function verifyProductOwnership(productId, userEmail) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { providerProfile: true },
  });
  
  if (!user?.providerProfile) {
    return { error: "Provider profile not found", status: 404 };
  }
  
  const product = await prisma.foodItem.findUnique({
    where: { id: productId },
  });
  
  if (!product) {
    return { error: "Product not found", status: 404 };
  }
  
  if (product.providerId !== user.providerProfile.id) {
    return { error: "You don't have permission to manage this product", status: 403 };
  }
  
  return { providerId: user.providerProfile.id };
}

// GET - Fetch a specific food item
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Get authenticated provider session
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Unauthorized. Provider access required." },
        { status: 401 }
      );
    }
    
    // Verify ownership
    const ownership = await verifyProductOwnership(id, session.user.email);
    if (ownership.error) {
      return NextResponse.json(
        { error: ownership.error },
        { status: ownership.status }
      );
    }
    
    // Fetch the food item with related data
    const foodItem = await prisma.foodItem.findUnique({
      where: { id },
      include: {
        category: true,
        provider: {
          select: {
            businessName: true,
            logo: true,
          },
        },
      },
    });
    
    if (!foodItem) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(foodItem);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product details" },
      { status: 500 }
    );
  }
}

// PUT - Update a food item
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    // Get authenticated provider session
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Unauthorized. Provider access required." },
        { status: 401 }
      );
    }
    
    // Verify ownership
    const ownership = await verifyProductOwnership(id, session.user.email);
    if (ownership.error) {
      return NextResponse.json(
        { error: ownership.error },
        { status: ownership.status }
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
    
    // Find the category
    const categoryRecord = await prisma.category.findUnique({
      where: { name: category },
    });
    
    if (!categoryRecord) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    // Calculate expiration date
    const now = new Date();
    const expiresAt = new Date(now.getTime() + parseInt(expiresIn) * 60 * 60 * 1000);
    
    // Update the food item
    const updatedItem = await prisma.foodItem.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(originalPrice),
        discountedPrice: parseFloat(discountedPrice),
        quantity: parseInt(quantity),
        categoryId: categoryRecord.id,
        image: image || null,
        expiresAt,
      },
    });
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a food item
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Get authenticated provider session
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Unauthorized. Provider access required." },
        { status: 401 }
      );
    }
    
    // Verify ownership
    const ownership = await verifyProductOwnership(id, session.user.email);
    if (ownership.error) {
      return NextResponse.json(
        { error: ownership.error },
        { status: ownership.status }
      );
    }
    
    // Delete the food item
    await prisma.foodItem.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
