import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get all categories with the count of food items in each
    const categories = await prisma.category.findMany();
    
    // Get counts of food items for each category (in a single query)
    const foodItemCounts = await prisma.foodItem.groupBy({
      by: ['categoryId'],
      _count: {
        id: true
      }
    });
    
    // Create a map of category ID to food item count
    const countMap = foodItemCounts.reduce((acc, curr) => {
      acc[curr.categoryId] = curr._count.id;
      return acc;
    }, {});
    
    // Enhance categories with food item count
    const enhancedCategories = categories.map(category => ({
      ...category,
      foodItemCount: countMap[category.id] || 0
    }));
    
    return NextResponse.json(enhancedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Check if category with this name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: name.trim() }
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create the category
    const category = await prisma.category.create({
      data: { name: name.trim() }
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
