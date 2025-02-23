'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import { Filters } from '@/components/Filters';
import { FoodCard } from '@/components/Food-Card';

const foods = [
  {
    name: "Artisan Bread Bundle",
    description: "Assorted freshly baked breads including sourdough, whole wheat, and rye",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1000",
    originalPrice: 15.99,
    discountedPrice: 7.99,
    provider: "Fresh Bakery",
    providerLogo: "https://images.unsplash.com/photo-1581873372796-635b67ca2008?w=100&q=80", 
    category: "Bakery",
    expiresIn: "3h"
  },
  {
    name: "Organic Vegetable Box",
    description: "Mix of seasonal organic vegetables perfect for a healthy meal",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000",
    originalPrice: 25.99,
    discountedPrice: 12.99,
    provider: "Green Market",
    providerLogo: "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=100&q=80", 
    category: "Grocery",
    expiresIn: "5h"
  },
  {
    name: "Pasta Special",
    description: "Homemade pasta with signature sauce and fresh ingredients",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&q=80&w=1000",
    originalPrice: 18.99,
    discountedPrice: 9.49,
    provider: "Pasta House",
    providerLogo: "https://images.unsplash.com/photo-1581873372796-635b67ca2008?w=100&q=80", 
    category: "Restaurant",
    expiresIn: "2h"
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="md:w-64 flex-shrink-0">
            <Filters />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {foods.map((food, index) => (
                    <FoodCard key={index} {...food} />
                  ))}
                </div>
          </div>
        </div>
      </main>
    </div>
  );
}