import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get providers with their orders for calculation
    const providers = await prisma.providerProfile.findMany({
      include: {
        orders: {
          include: {
            items: true
          }
        }
      }
    });

    // Calculate metrics for each provider
    const topRestaurants = providers.map(provider => {
      // Calculate total revenue
      const revenue = provider.orders.reduce((total, order) => {
        return total + order.totalAmount;
      }, 0);

      // Count unique customers
      const uniqueCustomers = new Set(
        provider.orders.map(order => order.userProfileId)
      ).size;

      return {
        id: provider.id,
        name: provider.businessName,
        customers: uniqueCustomers,
        revenue: parseFloat(revenue.toFixed(2))
      };
    });

    // Sort by revenue in descending order
    topRestaurants.sort((a, b) => b.revenue - a.revenue);

    // Return top 5 restaurants
    return NextResponse.json(topRestaurants.slice(0, 5));
  } catch (error) {
    console.error("Error fetching top restaurants:", error);
    return NextResponse.json(
      { error: "Failed to fetch top restaurants data" },
      { status: 500 }
    );
  }
}
