import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for provider analytics
  const mockData = {
    mostSoldItems: [
      { name: 'Vegetable Sandwich', count: 37, revenue: 148.00, category: 'Sandwiches' },
      { name: 'Chocolate Croissant', count: 29, revenue: 87.00, category: 'Pastries' },
      { name: 'Chicken Salad', count: 24, revenue: 168.00, category: 'Salads' },
      { name: 'Fresh Fruit Box', count: 22, revenue: 110.00, category: 'Fruits' },
      { name: 'Pasta with Tomato Sauce', count: 18, revenue: 126.00, category: 'Mains' },
    ],
    unsoldItems: [
      { name: 'Seafood Platter', count: 8, potential_loss: 120.00, category: 'Seafood' },
      { name: 'Kale Chips', count: 6, potential_loss: 30.00, category: 'Snacks' },
      { name: 'Mushroom Risotto', count: 5, potential_loss: 50.00, category: 'Mains' },
      { name: 'Vegan Cheesecake', count: 4, potential_loss: 32.00, category: 'Desserts' },
    ],
    categoryPerformance: [
      { category: 'Sandwiches', sold: 58, unsold: 7, salePercentage: 89 },
      { category: 'Pastries', sold: 47, unsold: 9, salePercentage: 84 },
      { category: 'Salads', sold: 36, unsold: 4, salePercentage: 90 },
      { category: 'Mains', sold: 42, unsold: 11, salePercentage: 79 },
      { category: 'Desserts', sold: 31, unsold: 14, salePercentage: 69 },
      { category: 'Snacks', sold: 25, unsold: 13, salePercentage: 66 },
    ],
    wasteReduction: {
      totalItemsSaved: 239,
      totalWeightSaved: "102.3kg",
      co2Prevented: "408.2kg",
      moneyRecovered: "1,673.00 IQD",
      previousMonth: {
        itemsSaved: 204,
        weightSaved: "87.6kg",
        improvement: "+17%"
      }
    },
    timePeriod: "Last 30 days (August 1 - August 30, 2023)"
  };

  return NextResponse.json(mockData);
}
