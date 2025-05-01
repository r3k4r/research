import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }
    
    // Get the provider profile ID
    const provider = await prisma.providerProfile.findUnique({
      where: {
        userId: session.user.id
      }
    });
    
    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found", success: false }, { status: 404 });
    }

   const { id } = params;
   
    
    if (!id) {
      return NextResponse.json({ error: "Customer ID is required", success: false }, { status: 400 });
    }
    
    try {
      // Fetch the customer and their orders from this provider
      const customer = await prisma.userProfile.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          location: true,
          phoneNumber: true,
          image: true,
          createdAt: true,
          orders: {
            where: {
              providerId: provider.id
            },
            select: {
              id: true,
              status: true,
              createdAt: true,
              totalAmount: true,
              items: {
                select: {
                  id: true,
                  quantity: true,
                  price: true,
                  product: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                      price: true,
                      category: true
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });
      
      if (!customer) {
        return NextResponse.json({ 
          error: "Customer not found", 
          message: `No customer found with ID: ${id}`,
          success: false 
        }, { status: 404 });
      }

      // Calculate summary statistics
      const totalOrders = customer.orders.length;
      const totalSpent = customer.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      let firstOrderDate = null;
      let lastOrderDate = null;
      
      if (totalOrders > 0) {
        const orderDates = customer.orders.map(o => new Date(o.createdAt).getTime());
        firstOrderDate = new Date(Math.min(...orderDates));
        lastOrderDate = new Date(Math.max(...orderDates));
      }

      // Add the summary statistics to the customer object
      const customerWithStats = {
        ...customer,
        totalOrders,
        totalSpent,
        firstOrderDate,
        lastOrderDate,
        success: true
      };
      
      return NextResponse.json(customerWithStats);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ 
        error: "Database error", 
        message: dbError.message,
        success: false 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error fetching customer details:", error);
    // Fix syntax error in the JSON response
    return NextResponse.json({
      error: "Internal server error", 
      message: error.message || "Unknown error occurred",
      success: false 
    }, { status: 500 });
  }
}
