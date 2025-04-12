import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name } = body;
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Check if another category with this name exists
    const duplicateNameCategory = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        id: { not: id }
      }
    });
    
    if (duplicateNameCategory) {
      return NextResponse.json(
        { error: 'Another category with this name already exists' },
        { status: 409 }
      );
    }
    
    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name: name.trim() }
    });
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Find all food items using this category to check if it's safe to delete
    const foodItemsCount = await prisma.foodItem.count({
      where: { categoryId: id }
    });
    
    // For safety, we'll check if this category is used by any food items
    // In a real application, you might want to implement a "force delete" option,
    // or reassign food items to another category
    if (foodItemsCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category that is in use', 
          foodItemsCount 
        },
        { status: 400 }
      );
    }
    
    // Delete the category
    await prisma.category.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
