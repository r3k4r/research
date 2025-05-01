import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get the provider profile ID
    const provider = await prisma.providerProfile.findUnique({
      where: {
        userId: session.user.id
      }
    });
    
    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    // Get the user profile with their orders from this provider
    const userProfile = await prisma.userProfile.findUnique({
      where: {
        id: id
      },
      select: {
        id: true,
        name: true,
        location: true,
        phoneNumber: true,
        image: true,
        orders: {
          where: {
            providerId: provider.id
          },
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            status: true,
            totalAmount: true,
            deliveryAddress: true,
            deliveryNotes: true,
            createdAt: true,
            updatedAt: true,
            items: {
              select: {
                id: true,
                quantity: true,
                price: true,
                foodItem: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    discountedPrice: true,
                    category: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            },
            statusLogs: {
              orderBy: {
                createdAt: 'desc'
              },
              select: {
                status: true,
                notes: true,
                createdAt: true
              }
            }
          }
        }
      }
    });

    if (!userProfile) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Calculate customer statistics
    const orders = userProfile.orders;
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Get most ordered items
    const itemCounts = {};
    let totalItems = 0;
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const itemName = item.foodItem.name;
        itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
        totalItems += item.quantity;
      });
    });
    
    const favoriteItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count, percentage: Math.round((count / totalItems) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    // First and last order dates
    const firstOrderDate = orders.length > 0 ? 
      new Date(Math.min(...orders.map(o => new Date(o.createdAt).getTime()))) : null;
      
    const lastOrderDate = orders.length > 0 ? 
      new Date(Math.max(...orders.map(o => new Date(o.createdAt).getTime()))) : null;

    // Return formatted customer data
    const customerData = {
      profile: {
        id: userProfile.id,
        name: userProfile.name,
        location: userProfile.location || "Not provided",
        phoneNumber: userProfile.phoneNumber || "Not provided", 
        image: userProfile.image
      },
      statistics: {
        totalOrders,
        totalSpent,
        firstOrderDate,
        lastOrderDate,
        favoriteItems
      },
      orders: orders.map(order => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        deliveryAddress: order.deliveryAddress,
        deliveryNotes: order.deliveryNotes || "",
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
          product: {
            id: item.foodItem.id,
            name: item.foodItem.name,
            description: item.foodItem.description,
            category: item.foodItem.category.name,
            originalPrice: item.foodItem.price,
            discountedPrice: item.foodItem.discountedPrice
          }
        })),
        statusLogs: order.statusLogs
      }))
    };

    return NextResponse.json(customerData);
    
  } catch (error) {
    console.error("Error fetching customer details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
