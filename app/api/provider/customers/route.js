import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";


export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const provider = await prisma.providerProfile.findUnique({
      where: {
        userId: session.user.id
      }
    });
    
    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    
    const customers = await prisma.purchasedOrder.findMany({
      where: {
        providerId: provider.id,
        userProfile: {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        }
      },
      select: {
        id: true,
        createdAt: true,
        userProfile: {
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
              select: {
                id: true,
                status: true,
                createdAt: true,
                totalAmount: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
    });
    
    // Transform the data to  a list of unique customers with order history
    const uniqueCustomers = [];
    const customerMap = new Map();
    
    for (const order of customers) {
      const customerId = order.userProfile.id;
      
      if (!customerMap.has(customerId)) {
        const customerOrders = order.userProfile.orders;
        const totalOrders = customerOrders.length;
        const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        customerMap.set(customerId, {
          id: customerId,
          name: order.userProfile.name,
          location: order.userProfile.location || "Not provided",
          phoneNumber: order.userProfile.phoneNumber || "Not provided",
          image: order.userProfile.image,
          firstOrderDate: new Date(Math.min(...customerOrders.map(o => new Date(o.createdAt)))),
          lastOrderDate: new Date(Math.max(...customerOrders.map(o => new Date(o.createdAt)))),
          totalOrders,
          totalSpent,
          orders: customerOrders
        });
      }
    }
    
    customerMap.forEach(customer => {
      uniqueCustomers.push(customer);
    });
    
    return NextResponse.json(uniqueCustomers);
    
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
