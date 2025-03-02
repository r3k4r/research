'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import { Filters } from '@/components/Filters';
import { FoodCard } from '@/components/Food-Card';
import { X, SlidersHorizontal } from 'lucide-react'; // Import icons

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 h-[calc(100vh-64px)]">
        <button 
          onClick={toggleFilter} 
          className="md:hidden flex items-center justify-center gap-2 bg-primary text-white rounded-md px-4 py-2 mb-4 w-full"
        >
          {isFilterOpen ? (
            <>
              <X size={18} />
              Close Filters
            </>
          ) : (
            <>
              <SlidersHorizontal size={18} />
              Show Filters
            </>
          )}
        </button>

        <div className="flex flex-col md:flex-row gap-6 h-full relative">
          <aside className={`${isFilterOpen ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto' : 'hidden'} 
            md:static md:block md:w-64 md:flex-shrink-0 md:overflow-y-auto  md:top-0 md:max-h-[calc(100vh-128px)]
            transition-all duration-300 ease-in-out`}>
            {isFilterOpen && (
              <button 
                onClick={toggleFilter}
                className="md:hidden absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            )}
            <Filters />
          </aside>


          {/* Main Content */}
          <div className="flex-1 overflow-y-auto scroll-smooth scroll-hidden max-h-[calc(100vh-128px)]">
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