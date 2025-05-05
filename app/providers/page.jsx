"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, MapPin, Phone, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { showToast, ToastComponent } = useToast();
  const router = useRouter();
  const observerRef = useRef(null);
  const lastProviderRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const fetchProviders = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      const currentPage = reset ? 1 : page;
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', 20);
      if (searchTerm) params.append('search', searchTerm);
      params.append('t', Date.now()); // Prevent caching
      
      const response = await fetch(`/api/providers?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }
      
      const data = await response.json();
      
      if (reset) {
        setProviders(data.providers || []);
      } else {
        setProviders(prev => {
          const existingIds = new Set(prev.map(provider => provider.id));
          const newItems = (data.providers || []).filter(provider => !existingIds.has(provider.id));
          return [...prev, ...newItems];
        });
      }
      
      setHasMore(data.pagination?.hasMore || false);
      if (!reset) {
        setPage(prev => prev + 1);
      }
      
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err.message);
      showToast('Failed to load providers', 'error');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [page, searchTerm, showToast]);

  // Initial data load
  useEffect(() => {
    fetchProviders(true);
  }, []); // Removed fetchProviders dependency to prevent infinite loop

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchProviders(true);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]); // Removed fetchProviders dependency to prevent infinite loop

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (loading || !hasMore) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchProviders(false);
      }
    }, { threshold: 0.1, rootMargin: '100px' });
    
    if (lastProviderRef.current) {
      observerRef.current.observe(lastProviderRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, providers.length]); // Changed dependency from fetchProviders to providers.length

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Format address to show only city and country if available
  const formatAddress = (address) => {
    if (!address) return "Address not provided";
    
    const parts = address.split(',').map(part => part.trim());
    if (parts.length >= 2) {
      return `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
    }
    return address;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {ToastComponent}
      
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-6">Food Providers</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search providers by name, location..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchProviders(true)}
              disabled={initialLoading || loading}
              className="whitespace-nowrap"
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

        {/* Providers list */}
        {initialLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading providers...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={() => fetchProviders(true)} 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm 
                ? `No providers found matching "${searchTerm}"` 
                : "No providers available at the moment."}
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  fetchProviders(true);
                }} 
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider, index) => {
              // Add a ref to the last provider for infinite scrolling
              const isLastProvider = index === providers.length - 1;
              
              return (
                <Card 
                  key={provider.id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  ref={isLastProvider ? lastProviderRef : null}
                  onClick={() => router.push(`/providers/${provider.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16 border">
                        {provider.logo ? (
                          <AvatarImage src={provider.logo} alt={provider.businessName} />
                        ) : null}
                        <AvatarFallback className="text-lg font-semibold bg-primary text-white">
                          {provider.businessName?.charAt(0) || "P"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h2 className="text-xl font-semibold">{provider.businessName}</h2>
                        <p className="text-muted-foreground text-sm">{provider.name}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{formatAddress(provider.address)}</span>
                      </div>
                      
                      {provider.phoneNumber && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{provider.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="bg-muted/50 px-6 py-3">
                    <Link 
                      href={`/providers/${provider.id}`}
                      className="text-sm text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View available items →
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Loading indicator for infinite scroll */}
        {!initialLoading && loading && (
          <div className="flex justify-center py-6 mt-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading more providers...</p>
            </div>
          </div>
        )}
        
        {/* No more providers indicator */}
        {!initialLoading && !loading && !hasMore && providers.length > 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No more providers to display
          </div>
        )}
      </div>
    </div>
  );
};

export default ProvidersPage;