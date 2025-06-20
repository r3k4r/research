'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';
import { OrderList } from '@/components/provider/OrderList';
import { OrderDetails } from '@/components/provider/OrderDetails';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';

export default function OrdersPage() {
  const { showToast, ToastComponent } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const firstLoadRef = useRef(true);
  
  // Function to fetch orders with improved error handling
  const fetchOrders = async (status = activeTab, search = searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);
      
      const timestamp = Date.now();
      params.append('t', timestamp);
      
      
      const apiUrl = `${window.location.origin}/api/provider/orders?${params.toString()}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      setOrders(data);
      
      if (selectedOrder) {
        const updatedSelectedOrder = data.find(order => order.id === selectedOrder.id);
        if (updatedSelectedOrder) {
          setSelectedOrder(updatedSelectedOrder);
        }
      }
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
      showToast(err.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptFetch = async () => {
      try {
        await fetchOrders(activeTab, searchTerm);
        firstLoadRef.current = false;
      } catch (err) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptFetch, 1000 * retryCount);
        } else {
          console.error('Max retries reached:', err);
        }
      }
    };
    
    if (firstLoadRef.current) {
      attemptFetch();
    }
    
    const intervalId = setInterval(() => {
      fetchOrders(activeTab, searchTerm);
    }, 60000); 
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
    fetchOrders(value, searchTerm);
  };
  
  // Handle search
  const handleSearch = () => {
    fetchOrders(activeTab, searchTerm);
  };
  
  // Handle order selection
  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
  };
  
  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus, notes, action = 'update', estimatedMinutes) => {
    try {
      // Prepare request body based on action type
      const requestBody = {
        orderId,
        notes,
        action: action || 'update'
      };
      
      if (action !== 'go-back') {
        requestBody.status = newStatus;
      }
      
      // Add estimated minutes if provided (for ACCEPTED status)
      if (newStatus === 'ACCEPTED' && estimatedMinutes) {
        requestBody.estimatedMinutes = parseInt(estimatedMinutes, 10);
      }
      
      // Get full URL with origin to ensure correct path in production
      const apiUrl = `${window.location.origin}/api/provider/orders`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      
      // Show success message
      showToast(
        action === 'go-back' 
          ? `Order status reverted successfully` 
          : `Order status updated to ${newStatus.replace('_', ' ')}`, 
        'success'
      );
      
      // Refresh the orders list
      fetchOrders(activeTab, searchTerm);
      
    } catch (err) {
      console.error('Error updating order status:', err);
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders Management</h1>

        <div className='flex items-center space-x-2'>
          <Link href={"/provider-dashboard/orders/orderreview"} >
            <Button 
              variant="outline" 
              size="sm"
            >
              Order Reviews
            </Button>
          </Link> 

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchOrders(activeTab, searchTerm)} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 max-w-[400px]">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders by ID or customer name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>Search</Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <div className="lg:w-[100%]">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Order List</CardTitle>
              <CardDescription>
                {loading ? 'Loading...' : `${orders.length} orders found`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="px-4 border-b">
                  <TabsList className="w-full justify-start h-auto py-0 bg-transparent space-x-4 overflow-auto">
                    <TabsTrigger value="all" className="py-2 px-1 text-[13px] md:text-md data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="PENDING" className="py-2 px-1 text-[13px] md:text-md data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                      Pending
                    </TabsTrigger>
                    <TabsTrigger value="ACCEPTED" className="py-2 px-1 text-[13px] md:text-md data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                      Accepted
                    </TabsTrigger>
                    <TabsTrigger value="PREPARING" className="py-2 px-1 text-[13px] md:text-md data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                      Preparing
                    </TabsTrigger>
                    <TabsTrigger value="IN_TRANSIT" className="py-2 px-1 text-[13px] md:text-md data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                      In Transit
                    </TabsTrigger>
                    <TabsTrigger value="DELIVERED" className="py-2 px-1 text-[13px] md:text-md data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                      Delivered
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value={activeTab} className="m-0">
                  <OrderList 
                    orders={orders}
                    selectedOrderId={selectedOrder?.id}
                    onOrderSelect={handleOrderSelect}
                    loading={loading}
                    error={error}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:w-[100%]">
          {selectedOrder ? (
            <OrderDetails 
              order={selectedOrder} 
              onStatusUpdate={handleStatusUpdate}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="pt-10 text-center text-muted-foreground">
                <p>Select an order to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {ToastComponent}
    </div>
  );
}
