"use client";

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Search, RefreshCw, User, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [displayedCustomers, setDisplayedCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast, ToastComponent } = useToast();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const router = useRouter();

  const fetchCustomers = async (search = '') => {
    try {
      if (search) {
        setSearching(true);
      } else {
        setRefreshing(true);
        setCustomers([]);
        setDisplayedCustomers([]);
      }
      setLoading(true);
      setError(null);
      
      const timestamp = Date.now();
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('t', timestamp);
      
      const response = await fetch(`/api/provider/customers?${params.toString()}`, {
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!search) {
        await new Promise(resolve => setTimeout(resolve, 800)); 
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      setCustomers(data);
      setCurrentPage(1);
      
      if (search) {
        showToast(`Found ${data.length} customers matching "${search}"`, 'success');
      } else {
        showToast('Customer data refreshed successfully', 'success');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.message);
      showToast(err.message || 'Failed to load customers', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = customers.slice(indexOfFirstItem, indexOfLastItem);
    
    setDisplayedCustomers(currentItems);
  }, [customers, currentPage, itemsPerPage]);

  const handleRefresh = () => {
    fetchCustomers();
  };

  const [searchTimeout, setSearchTimeout] = useState(null);
  
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (value.length === 0 || value.length >= 2) {
        fetchCustomers(value);
      }
    }, 800);
    
    setSearchTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleRowClick = (customerId) => {
    router.push(`/provider-dashboard/customers/${customerId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Customers</h1>
         
         <div className='flex items-center gap-2'>
                <Badge variant="secondary" className="h-8 w-16 flex items-center justify-center">
                    {customers.length} total
                </Badge>
                <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={refreshing || searching}
                className="whitespace-nowrap relative"
                >
                {refreshing ? (
                    <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Refreshing...</span>
                    </>
                ) : (
                    <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    <span>Refresh Data</span>
                    </>
                )}
                </Button>
         </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>
                View your customer base and their order history
              </CardDescription>
            </div>
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              {searching && (
                <div className="absolute right-2.5 top-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              <Input
                placeholder="Search by name, phone or location..."
                className={`pl-8 w-full ${searching ? 'pr-8' : ''}`}
                value={searchTerm}
                onChange={handleSearch}
                disabled={refreshing || searching}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {loading && customers.length === 0 ? (
            <div className="flex justify-center items-center p-8">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
                <span>Loading customers...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error: {error}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={handleRefresh}
              >
                Try Again
              </Button>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No customers found</p>
              <p className="text-sm mt-2">
                {searchTerm ? 'Try a different search term' : 'Customers who place orders will appear here'}
              </p>
            </div>
          ) : (
            <>
              {refreshing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 rounded-full border-4 border-t-transparent border-primary animate-spin"></div>
                    <p>Refreshing customer data...</p>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Contact</TableHead>
                      <TableHead className="hidden lg:table-cell">Location</TableHead>
                      <TableHead className="text-center">Orders</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                      <TableHead className="hidden sm:table-cell text-right">Last Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedCustomers.map((customer) => (
                      <TableRow 
                        key={customer.id} 
                        className="cursor-pointer hover:bg-secondary/30 transition-colors"
                        onClick={() => handleRowClick(customer.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {customer.image ? (
                                <AvatarImage src={customer.image} alt={customer.name} />
                              ) : null}
                              <AvatarFallback>
                                {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-muted-foreground md:hidden">
                                {customer.phoneNumber || "No phone"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {customer.phoneNumber}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {customer.location}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{customer.totalOrders}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(customer.totalSpent)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-right text-muted-foreground">
                          {formatDate(customer.lastOrderDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
        {customers.length > 0 && !error && (
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t p-4 gap-4">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {displayedCustomers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, customers.length)} of {customers.length} customers
            </div>
            <div className="flex items-center space-x-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
                disabled={currentPage === 1 || refreshing || searching}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {Math.max(1, totalPages)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0 || refreshing || searching}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
      
      {ToastComponent}
    </div>
  );
}