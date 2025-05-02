'use client';

import { useState, useEffect, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { FilterX } from 'lucide-react';
import { useDebounce } from '@/lib/use-debounce';

export function Filters({ 
  onFilterChange,
  loading,
  maxPriceLimit = 50
}) {
  // State for filters
  const [priceRange, setPriceRange] = useState([0, maxPriceLimit]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Debounce price changes to avoid too many API requests
  const debouncedPriceRange = useDebounce(priceRange, 500);
  
  // Fetch categories on component mount
  useEffect(() => {
    let isMounted = true;
    
    async function fetchCategories() {
      try {
        if (!isMounted) return;
        setLoadingCategories(true);
        
        const response = await fetch(`/api?limit=1&t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!isMounted) return;
        
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const data = await response.json();
        
        if (!isMounted) return;
        setCategories(data.categories || []);
        setIsInitialized(true);
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching categories:', error);
        }
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    }
    
    fetchCategories();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Apply filters when they change
  useEffect(() => {
    // Only apply filter changes after initial load
    if (!isInitialized) return;
    
    if (onFilterChange) {
      onFilterChange({
        minPrice: debouncedPriceRange[0],
        maxPrice: debouncedPriceRange[1],
        categories: selectedCategories.length > 0 ? selectedCategories : null,
      });
    }
  }, [debouncedPriceRange, selectedCategories, onFilterChange, isInitialized]);
  
  // Update price range when max limit changes
  useEffect(() => {
    setPriceRange(prev => [prev[0], maxPriceLimit]);
  }, [maxPriceLimit]);
  
  const toggleCategory = useCallback((categoryId, categoryName) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  }, []);
  
  // Reset all filters
  const resetFilters = useCallback(() => {
    setPriceRange([0, maxPriceLimit]);
    setSelectedCategories([]);
  }, [maxPriceLimit]);

  return (
    <div className="flex flex-col space-y-6 p-4 bg-white rounded-lg shadow-sm">
      {/* Price Range Section */}
      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            max={maxPriceLimit}
            step={1}
            onValueChange={setPriceRange}
            disabled={loading}
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
        {loadingCategories ? (
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id, category.name)}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-sm border transition-all
                  ${selectedCategories.includes(category.id)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reset Filters Button */}
      <div className="pt-2">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full flex items-center gap-2"
          onClick={resetFilters}
          disabled={loading}
        >
          <FilterX size={16} />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}