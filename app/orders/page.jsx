'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { CheckCircle, Clock, Package, AlertTriangle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { showToast, ToastComponent } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const fetchedRef = useRef(false);
  const tabChangeRef = useRef(false);
  const activeTabRef = useRef(activeTab);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin?callbackUrl=/orders');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    
    activeTabRef.current = activeTab;
    
    async function fetchOrders() {
      if (tabChangeRef.current && activeTabRef.current === activeTab) {
        tabChangeRef.current = false;
        return;
      }

      try {
        setLoading(true);
        
        const params = new URLSearchParams();
        if (activeTab !== 'all') {
          params.append('status', activeTab);
        }
        params.append('t', Date.now() + Math.random());
        
        const response = await fetch(`/api/orders?${params.toString()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        showToast('Failed to load orders', 'error');
      } finally {
        setLoading(false);
        fetchedRef.current = true;
      }
    }

    if (!fetchedRef.current || tabChangeRef.current) {
      fetchOrders();
    }
  }, [activeTab, status, showToast]);

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab);

  const handleTabChange = (value) => {
    if (value !== activeTab) {
      setActiveTab(value);
      tabChangeRef.current = true;
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Pending</span>
          </Badge>
        );
      case 'PREPARING':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            <span>Preparing</span>
          </Badge>
        );
      case 'IN_TRANSIT':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            <span>In Transit</span>
          </Badge>
        );
      case 'DELIVERED':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Delivered</span>
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Cancelled</span>
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    try {
      setIsCancelling(true);
      
      const response = await fetch(`/api/orders/${orderToCancel.id}/cancel`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel order');
      }
      
      setOrders(prev => prev.map(order => 
        order.id === orderToCancel.id 
          ? {...order, status: 'CANCELLED'} 
          : order
      ));
      
      showToast('Order cancelled successfully', 'success');
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast(error.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelDialogOpen(false);
      setOrderToCancel(null);
      setIsCancelling(false);
    }
  };
  
  const openCancelDialog = (order) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="PREPARING">Preparing</TabsTrigger>
            <TabsTrigger value="IN_TRANSIT">In Transit</TabsTrigger>
            <TabsTrigger value="DELIVERED">Delivered</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading orders...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Order #{order.id.substring(0, 8).toUpperCase()}</CardTitle>
                        {getStatusBadge(order.status)}
                      </div>
                      <CardDescription>
                        {formatDate(order.date)}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full">
                            {order.providerLogo ? (
                              <Image
                                src={order.providerLogo}
                                alt={order.provider}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="bg-primary h-full w-full flex items-center justify-center text-white">
                                {order.provider.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">{order.provider}</h3>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Items</h3>
                          <ul className="space-y-1">
                            {order.items.map((item, index) => (
                              <li key={index} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.name}</span>
                                <span>{(item.price * item.quantity).toFixed(2)} IQD</span>
                              </li>
                            ))}
                          </ul>
                          <div className="pt-2 mt-2 border-t">
                            <div className="flex justify-between text-sm">
                              <span>Subtotal</span>
                              <span>{order.subtotal.toFixed(2)} IQD</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Delivery Fee</span>
                              <span>{order.deliveryFee.toFixed(2)} IQD</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Service Fee</span>
                              <span>{order.serviceFee.toFixed(2)} IQD</span>
                            </div>
                            <div className="flex justify-between font-medium pt-1 mt-1 border-t">
                              <span>Total</span>
                              <span>{order.total.toFixed(2)} IQD</span>
                            </div>
                          </div>
                        </div>
                        
                        {order.status === 'PREPARING' && (
                          <div className="bg-blue-50 p-3 rounded-md text-sm">
                            <p className="font-medium text-blue-800">Your order is being prepared</p>
                            {order.timeline && order.timeline[0] && (
                              <p>Last update: {formatDate(order.timeline[0].date)}</p>
                            )}
                          </div>
                        )}
                        
                        {order.status === 'IN_TRANSIT' && (
                          <div className="bg-blue-50 p-3 rounded-md text-sm">
                            <p className="font-medium text-blue-800">Your order is on the way</p>
                            {order.timeline && order.timeline[0] && (
                              <p>Last update: {formatDate(order.timeline[0].date)}</p>
                            )}
                          </div>
                        )}
                        
                        {order.status === 'DELIVERED' && (
                          <div className="bg-green-50 p-3 rounded-md text-sm">
                            <p className="font-medium text-green-800">Order Delivered</p>
                            <p className="mt-1">Your order has been delivered successfully</p>
                            {order.timeline && order.timeline[0] && (
                              <p>Delivered at: {formatDate(order.timeline[0].date)}</p>
                            )}
                          </div>
                        )}
                        
                        {order.status === 'CANCELLED' && (
                          <div className="bg-red-50 p-3 rounded-md text-sm">
                            <p className="font-medium text-red-800">Order Cancelled</p>
                            {order.timeline && order.timeline[0] && order.timeline[0].notes && (
                              <p className="mt-1">Reason: {order.timeline[0].notes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    {order.status === 'PENDING' && (
                      <CardFooter className="border-t pt-4">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="ml-auto"
                          onClick={() => openCancelDialog(order)}
                        >
                          Cancel Order
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>No, keep order</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : 'Yes, cancel order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {ToastComponent}
    </div>
  );
}