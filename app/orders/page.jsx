'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Mock data for orders
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
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredOrders = activeTab === 'all' 
    ? mockOrders 
    : mockOrders.filter(order => order.status === activeTab);
  
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
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">In Progress</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">{order.id}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Order Details</h3>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span>${(item.quantity * item.price).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm">
                            <span>Delivery Fee</span>
                            <span>$2.00</span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium mb-2">Provider</h3>
                          <p className="text-sm">{order.provider}</p>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Delivery Address</h3>
                          <p className="text-sm">{order.deliveryAddress}</p>
                        </div>
                      </div>
                      
                      {order.status === 'in_progress' && (
                        <div className="bg-blue-50 p-4 rounded-md">
                          <h3 className="font-medium mb-2 text-blue-800">Delivery Information</h3>
                          <p className="text-sm">Your order is on the way!</p>
                          <p className="text-sm">Delivery Person: {order.deliveryPerson}</p>
                          <p className="text-sm">Estimated Arrival: {formatDate(order.estimatedDelivery)}</p>
                        </div>
                      )}
                      
                      {order.status === 'delivered' && (
                        <div className="bg-green-50 p-4 rounded-md">
                          <h3 className="font-medium mb-2 text-green-800">Delivery Completed</h3>
                          <p className="text-sm">Delivered by: {order.deliveryPerson}</p>
                          <p className="text-sm">Delivered at: {formatDate(order.deliveryTime)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}