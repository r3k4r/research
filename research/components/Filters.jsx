'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';

export function Filters() {
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const categories = ['Bakery', 'Restaurant', 'Grocery', 'Cafe'];
  const types = ['Meals', 'Snacks', 'Desserts', 'Beverages'];

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="flex flex-col space-y-6 p-4 bg-white rounded-lg shadow-sm">
      {/* Price Range Section */}
      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            max={50}
            step={1}
            onValueChange={setPriceRange}
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div>
        <h3 className="font-medium mb-4">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`px-4 py-2 rounded-full text-sm border transition-all
                ${selectedCategories.includes(category)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Types Section */}
      <div>
        <h3 className="font-medium mb-4">Types</h3>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`px-4 py-2 rounded-full text-sm border transition-all
                ${selectedTypes.includes(type)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}