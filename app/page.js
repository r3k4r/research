'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { Filters } from '@/components/Filters';
import { FoodCard } from '@/components/Food-Card';
import { X, SlidersHorizontal, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function Home() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [maxPriceLimit, setMaxPriceLimit] = useState(50);
  
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 50,
    categories: null
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const observerRef = useRef(null);
  const lastFoodElementRef = useRef(null);
  const isMountedRef = useRef(true);
  
  const { showToast, ToastComponent } = useToast();

  const fetchFoods = useCallback(async (reset = false, currentPage = 1) => {
    if ((reset && loading) || (!reset && loadingMore)) {
      return;
    }
    
    try {
      const newPage = reset ? 1 : currentPage;
      if (reset) {
        setLoadingMore(false);
        setLoading(true); 
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams();
      params.append('page', newPage);
      params.append('limit', 12);
      
      if (searchTerm) params.append('search', searchTerm);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice);
      if (filters.categories && filters.categories.length) {
        filters.categories.forEach(category => params.append('category', category));
      }
      
      params.append('t', Date.now());
      
      console.log('Fetching items with params:', params.toString());
      
      const response = await fetch(`/api?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch food items');
      
      const data = await response.json();
      console.log('Received data:', { 
        itemsCount: data.foodItems?.length, 
        totalItems: data.pagination?.totalItems,
        hasMore: data.pagination?.hasMore
      });
      
      if (!isMountedRef.current) return;
      
      if (data.priceRange) {
        if (reset && data.priceRange.max > 0) {
          setMaxPriceLimit(Math.ceil(data.priceRange.max));
          if (!isFilterApplied) {
            setFilters(prev => ({...prev, maxPrice: Math.ceil(data.priceRange.max)}));
          }
        }
      }
      
      setTotalItems(data.pagination?.totalItems || 0);
      setHasMore(data.pagination?.hasMore || false);
      
      if (reset) {
        setFoods(data.foodItems || []);
        setPage(1);
      } else {
        setFoods(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = (data.foodItems || []).filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
      setError(error.message);
      showToast('Failed to load food items. Please try again later.', 'error');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [searchTerm, filters, showToast, isFilterApplied]); 
  useEffect(() => {
    console.log('Initial load effect triggered');
    isMountedRef.current = true; 
    fetchFoods(true);
    
    return () => {
      isMountedRef.current = false;
    };
  }, []); 

  useEffect(() => {
    
    const timer = setTimeout(() => {
      if (isMountedRef.current && document.readyState === 'complete') {
        fetchFoods(true);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, filters]); 
  
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    if (!hasMore || loading || loadingMore) return;
    
    observerRef.current = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        
        if (entry && entry.isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = page + 1;
          fetchFoods(false, nextPage);
          setPage(nextPage);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    const currentRef = lastFoodElementRef.current;
    if (currentRef) {
      observerRef.current.observe(currentRef);
    }
    
    return () => {
      if (currentRef && observerRef.current) {
        observerRef.current.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, loadingMore, page, foods.length]); 

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => {
      const updatedFilters = {...prev, ...newFilters};
      setIsFilterApplied(true);
      return updatedFilters;
    });
  }, []);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const LoadingComponent = () => (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading items...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {ToastComponent}
      
      <main className="container mx-auto px-4 py-8 h-full">
        {/* Mobile filter toggle */}
        <div className="flex flex-col md:flex-row gap-6 h-full relative">
          {/* Filters sidebar */}
          <aside className={`${isFilterOpen ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto' : 'hidden'} 
            md:static md:block md:w-64 md:flex-shrink-0 md:overflow-y-auto md:top-0 md:max-h-[calc(100vh-128px)]
            transition-all duration-300 ease-in-out`}>
            {isFilterOpen && (
              <button 
                onClick={toggleFilter}
                className="md:hidden absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            )}
            <Filters 
              onFilterChange={handleFilterChange} 
              loading={loading} 
              maxPriceLimit={maxPriceLimit}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto scroll-smooth scroll-hidden">
            {/* Search bar visible only on larger screens */}
            <div className="flex flex-row items-center md:mb-6 gap-2">
              <div className="relative flex-1 flex items-center max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search food items, restaurants, or descriptions..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchFoods(true);
                    }
                  }}
                />
              </div>

              <button 
                  onClick={toggleFilter} 
                  className="md:hidden flex items-center justify-center gap-2 bg-primary text-white rounded-md px-4 py-2"
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
            </div>

            <br />
            
            {/* Results count */}
            <div className="mb-4 text-sm text-muted-foreground">
              {loading && page === 1 ? (
                "Loading items..."
              ) : (
                `Showing ${foods.length} of ${totalItems} items`
              )}
            </div>

            {/* Loading state */}
            {loading && page === 1 ? (
              <LoadingComponent />
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => fetchFoods(true)} 
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : foods.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No food items found for the selected filters.</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilters({
                      minPrice: 0,
                      maxPrice: maxPriceLimit,
                      categories: null
                    });
                    setSearchTerm('');
                    fetchFoods(true);
                  }} 
                  className="mt-4"
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {foods.map((food, index) => {
                  // Add ref to the last element for infinite scrolling
                  if (foods.length === index + 1) {
                    return (
                      <div ref={lastFoodElementRef} key={food.id || index}>
                        <FoodCard
                          id={food.id}
                          name={food.name}
                          description={food.description}
                          image={food.image || "/default-food.jpg"}
                          originalPrice={food.price}
                          discountedPrice={food.discountedPrice}
                          provider={food.provider?.businessName || "Unknown"}
                          providerId={food.provider?.id}
                          providerLogo={food.provider?.logo || "/default-logo.png"}
                          category={food.category?.name || "Uncategorized"}
                          expiresIn={getExpiresInText(food.expiresAt)}
                          quantity={food.quantity}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <FoodCard
                        key={food.id || index}
                        id={food.id}
                        name={food.name}
                        description={food.description}
                        image={food.image || "/default-food.jpg"}
                        originalPrice={food.price}
                        discountedPrice={food.discountedPrice}
                        provider={food.provider?.businessName || "Unknown"}
                        providerId={food.provider?.id}
                        providerLogo={food.provider?.logo || "/default-logo.png"}
                        category={food.category?.name || "Uncategorized"}
                        expiresIn={getExpiresInText(food.expiresAt)}
                        quantity={food.quantity}
                      />
                    );
                  }
                })}
              </div>
            )}
            
            {/* Loading more indicator */}
            {loadingMore && (
              <div className="flex justify-center py-6">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading more...</p>
                </div>
              </div>
            )}
            
            {/* Manual load more button */}
            {hasMore && foods.length > 0 && !loading && !loadingMore && (
              <div className="flex justify-center my-8">
                <Button 
                  variant="outline"
                  onClick={() => {
                    const nextPage = page + 1;
                    fetchFoods(false, nextPage);
                    setPage(nextPage);
                  }}
                >
                  Load more items
                </Button>
              </div>
            )}
            
            {/* No more items indicator */}
            {!hasMore && foods.length > 0 && !loading && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No more items to display
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper function to format the expires in text
function getExpiresInText(expiresAt) {
  if (!expiresAt) return "Unknown";
  
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires - now;
  
  if (diffMs < 0) return "Expired";
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 24) {
    return `${Math.floor(diffHours / 24)}d ${diffHours % 24}h`;
  }
  
  if (diffHours === 0) {
    return `${diffMinutes}m`;
  }
  
  return `${diffHours}h ${diffMinutes}m`;
}