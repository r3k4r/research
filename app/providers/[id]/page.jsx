"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { FoodCard } from '@/components/Food-Card';
import { 
  Search, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Clock, 
  RefreshCw, 
  Loader2, 
  Calendar,
  Tag
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SingleProvider = () => {
  const { id } = useParams();
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();
  
  const [provider, setProvider] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const observerRef = useRef(null);
  const lastItemRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const fetchInProgressRef = useRef(false);

  // Fetch provider data and food items
  const fetchProviderData = async (reset = false) => {
    // Prevent multiple simultaneous fetches
    if (fetchInProgressRef.current) {
      return;
    }
    
    try {
      fetchInProgressRef.current = true;
      
      if (reset) {
        setLoading(true);
        setPage(1);
      }
      
      const currentPage = reset ? 1 : page;
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', 12);
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('t', Date.now()); // Prevent caching
      
      const response = await fetch(`/api/providers/${id}?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(response.status === 404 ? 'Provider not found' : 'Failed to load provider data');
      }
      
      const data = await response.json();
      
      if (reset) {
        setProvider(data.provider);
        setFoodItems(data.foodItems || []);
        setCategories(data.categories || []);
      } else {
        setFoodItems(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = (data.foodItems || []).filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      }
      
      setHasMore(data.pagination?.hasMore || false);
      
      if (!reset && data.pagination?.hasMore) {
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error fetching provider data:', err);
      setError(err.message);
      showToast('Failed to load provider data', 'error');
    } finally {
      setLoading(false);
      setInitialLoading(false);
      fetchInProgressRef.current = false;
    }
  };

  // Initial data load
  useEffect(() => {
    fetchProviderData(true);
    
    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchProviderData(true);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, selectedCategory]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (loading || !hasMore || !lastItemRef.current) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading && !fetchInProgressRef.current) {
        fetchProviderData(false);
      }
    }, { threshold: 0.1, rootMargin: '100px' });
    
    observerRef.current.observe(lastItemRef.current);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, foodItems.length]); 

  // Handle navigation back to providers list
  const goBack = () => {
    router.push('/providers');
  };

  // Format business hours for display
  const formatBusinessHours = (hoursString) => {
    if (!hoursString) return "Hours not specified";
    
    try {
      const hours = JSON.parse(hoursString);
      return Object.entries(hours)
        .map(([day, time]) => `${day}: ${time}`)
        .join(' | ');
    } catch (e) {
      return hoursString;
    }
  };

  // Get expires in text for food items
  const getExpiresInText = (expiresAt) => {
    if (!expiresAt) return "Unknown";
    
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    
    const diffInHours = (expiryDate - now) / (1000 * 60 * 60);
    
    if (diffInHours < 0) {
      return "Expired";
    } else if (diffInHours < 1) {
      return "Less than 1 hour";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours`;
    } else {
      return `${Math.floor(diffInHours / 24)} days`;
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading provider details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-destructive mb-4">{error}</h2>
          <Button 
            onClick={goBack}
            variant="outline"
            className="mr-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> 
            Back to Providers
          </Button>
          <Button 
            onClick={() => fetchProviderData(true)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Provider not found</h2>
          <Button 
            onClick={goBack}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> 
            Back to Providers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {ToastComponent}
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={goBack}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Providers
      </Button>
      
      {/* Provider overview section - stacked on mobile, side by side on desktop */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Provider details */}
        <div className="md:col-span-2 order-2 md:order-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl">{provider.businessName}</CardTitle>
              <CardDescription>{provider.name}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Provider description */}
              {provider.description && (
                <div>
                  <h3 className="text-sm font-medium mb-2">About</h3>
                  <p className="text-muted-foreground">{provider.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Contact & Address */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Contact</h3>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span className="text-sm">{provider.address || "Address not provided"}</span>
                  </div>
                  {provider.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{provider.phoneNumber}</span>
                    </div>
                  )}
                </div>
                
                {/* Business hours */}
                {provider.businessHours && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Business Hours</h3>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span className="text-sm">{formatBusinessHours(provider.businessHours)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Provider stats */}
              <div className="space-y-2 pt-2 border-t">
                <h3 className="text-sm font-medium">Provider Info</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Joined {format(new Date(provider.joinedDate), 'MMMM yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {provider.stats.totalActiveItems} Active Items
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {provider.stats.minPrice > 0 && (
                    <Badge variant="outline">
                      Price range: {provider.stats.minPrice} - {provider.stats.maxPrice} IQD
                    </Badge>
                  )}
                  {provider.stats.avgPrice > 0 && (
                    <Badge variant="outline">
                      Avg price: {provider.stats.avgPrice} IQD
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Provider logo/image - Full width on mobile, 1/3 width on desktop */}
        <div className="md:col-span-1 order-1 md:order-2">
          <Card className="h-full flex items-center justify-center p-4 sm:p-6">
            <div className="relative w-full h-48 sm:h-64 rounded-md overflow-hidden border">
              {provider.logo ? (
                <Image 
                  src={provider.logo} 
                  alt={provider.businessName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-white text-4xl sm:text-5xl font-bold">
                  {provider.businessName.charAt(0)}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Food items section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-6">Available Food Items</h2>
        
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search food items..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className='flex items-center gap-2'>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectGroup>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchProviderData(true)}
              disabled={loading}
              className="sm:whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Food items grid */}
        {foodItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== 'all'
                ? 'No items found with the selected filters'
                : 'No items available from this provider'}
            </p>
            
            {(searchTerm || selectedCategory !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }} 
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {foodItems.map((item, index) => {
              const isLastItem = index === foodItems.length - 1;
              
              return (
                <div 
                  key={item.id} 
                  ref={isLastItem ? lastItemRef : null}
                >
                  <FoodCard
                    id={item.id}
                    name={item.name}
                    description={item.description || ""}
                    image={item.image || "/default-food.jpg"}
                    originalPrice={item.price}
                    discountedPrice={item.discountedPrice}
                    provider={provider.businessName}
                    providerId={provider.id}
                    providerLogo={provider.logo || "/default-logo.png"}
                    category={item.category?.name || "Uncategorized"}
                    expiresIn={getExpiresInText(item.expiresAt)}
                    quantity={item.quantity}
                  />
                </div>
              );
            })}
          </div>
        )}
        
        {/* Loading indicator */}
        {loading && !initialLoading && (
          <div className="flex justify-center py-6 mt-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading more items...</p>
            </div>
          </div>
        )}
        
        {/* No more items indicator */}
        {!loading && !hasMore && foodItems.length > 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No more items available
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleProvider;