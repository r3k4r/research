'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Package, AlertTriangle } from 'lucide-react';
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

const mockOrders = [
  {
    id: 'ORD-123456',
    date: '2025-04-15T14:30:00',
    status: 'delivered',
    items: [
      { name: 'Artisan Bread Bundle', quantity: 1, price: 7.99 },
      { name: 'Organic Vegetable Box', quantity: 2, price: 12.99 }
    ],
    total: 33.97,
    provider: 'Fresh Bakery',
    deliveryAddress: '123 Main St, Anytown, USA',
    deliveryPerson: 'John D.',
    deliveryTime: '2025-04-15T15:15:00'
  },
  {
    id: 'ORD-123457',
    date: '2025-04-14T12:15:00',
    status: 'delivered',
    items: [
      { name: 'Pasta Special', quantity: 1, price: 9.49 }
    ],
    total: 11.49, // Including delivery fee
    provider: 'Pasta House',
    deliveryAddress: '123 Main St, Anytown, USA',
    deliveryPerson: 'Sarah M.',
    deliveryTime: '2025-04-14T12:45:00'
  },
  {
    id: 'ORD-123458',
    date: '2025-04-16T18:00:00',
    status: 'pending',
    items: [
      { name: 'Organic Vegetable Box', quantity: 1, price: 12.99 },
      { name: 'Artisan Bread Bundle', quantity: 1, price: 7.99 }
    ],
    total: 22.98,
    provider: 'Green Market',
    deliveryAddress: '123 Main St, Anytown, USA'
  },
  {
    id: 'ORD-123459',
    date: '2025-04-16T17:30:00',
    status: 'in_progress',
    items: [
      { name: 'Pasta Special', quantity: 2, price: 9.49 }
    ],
    total: 20.98,
    provider: 'Pasta House',
    deliveryAddress: '123 Main St, Anytown, USA',
    deliveryPerson: 'Mike T.',
    estimatedDelivery: '2025-04-16T18:15:00'
  }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState(mockOrders);
  const [activeTab, setActiveTab] = useState('all');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  
  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);
  
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
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Pending</span>
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            <span>In Progress</span>
          </Badge>
        );
      case 'delivered':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Delivered</span>
          </Badge>
        );
      case 'canceled':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Canceled</span>
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleCancelOrder = (orderId) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? {...order, status: 'canceled'} 
        : order
    ));
    setCancelDialogOpen(false);
  };
  
  const openCancelDialog = (order) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="canceled">Canceled</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{order.id}</CardTitle>
                        {getStatusBadge(order.status)}
                      </div>
                      <CardDescription>
                        {formatDate(order.date)}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        {/* Provider */}
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Provider</h3>
                          <p>{order.provider}</p>
                        </div>
                        
                        {/* Order Items */}
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Items</h3>
                          <ul className="space-y-1">
                            {order.items.map((item, index) => (
                              <li key={index} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.name}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="pt-2 mt-2 border-t flex justify-between font-medium">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        {/* Status-specific information */}
                        {order.status === 'in_progress' && (
                          <div className="bg-blue-50 p-3 rounded-md text-sm">
                            <p className="font-medium text-blue-800">Your order is on the way!</p>
                            <p className="mt-1">Delivery Person: {order.deliveryPerson}</p>
                            <p>Estimated Arrival: {formatDate(order.estimatedDelivery)}</p>
                          </div>
                        )}
                        
                        {order.status === 'delivered' && (
                          <div className="bg-green-50 p-3 rounded-md text-sm">
                            <p className="font-medium text-green-800">Delivered</p>
                            <p className="mt-1">By: {order.deliveryPerson}</p>
                            <p>At: {formatDate(order.deliveryTime)}</p>
                          </div>
                        )}
                        
                        {order.status === 'canceled' && (
                          <div className="bg-red-50 p-3 rounded-md text-sm">
                            <p className="font-medium text-red-800">Order was canceled</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    {order.status === 'pending' && (
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
      
      {/* Cancel Order Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep order</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => orderToCancel && handleCancelOrder(orderToCancel.id)}
            >
              Yes, cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}