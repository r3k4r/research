import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Get a single food item
export async function GET(request, { params }) {
  const { id } = params;
  
  try {
    const item = await prisma.foodItem.findUnique({
      where: { id },
      include: {
        provider: true,
        category: true
      }
    });
    
    if (!item) {
      return NextResponse.json(
        { error: "Food item not found" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching food item:", error);
    return NextResponse.json(
      { error: "Failed to fetch food item" }, 
      { status: 500 }
    );
  }
}

// Update a food item
export async function PUT(request, { params }) {
  const { id } = params;
  
  try {
    const body = await request.json();
    
    // Calculate expiry date from expiresIn hours if provided
    let expiresAt;
    if (body.expiresIn) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(body.expiresIn));
    }
    
    // Find or create the category with case-insensitive search
    let categoryId;
    if (body.category) {
      let category = await prisma.category.findFirst({
        where: { 
          name: {
            equals: body.category,
            mode: 'insensitive'
          }
        }
      });
      
      if (!category) {
        category = await prisma.category.create({
          data: { name: body.category }
        });
      }
      
      categoryId = category.id;
    }
    
    // Update the food item
    const updatedItem = await prisma.foodItem.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.originalPrice),
        discountedPrice: parseFloat(body.discountedPrice),
        quantity: body.quantity !== undefined ? parseInt(body.quantity) : undefined,
        image: body.image,
        categoryId: categoryId,
        expiresAt: expiresAt
      },
      include: {
        provider: {
          select: {
            businessName: true,
            logo: true
          }
        },
        category: true
      }
    });
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating food item:", error);
    return NextResponse.json(
      { error: "Failed to update food item", details: error.message }, 
      { status: 500 }
    );
  }
}

// Delete a food item
export async function DELETE(request, { params }) {
  const { id } = params;
  
  try {
    await prisma.foodItem.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting food item:", error);
    return NextResponse.json(
      { error: "Failed to delete food item" }, 
      { status: 500 }
    );
  }
}
