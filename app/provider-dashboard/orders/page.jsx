'use client';

import { useState } from 'react';
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

// Sample data
const mockOrders = [
  {
    id: 'ORD-12345',
    customerName: 'John Doe',
    date: '2023-07-20T10:30:00',
    status: 'PENDING',
    totalAmount: 29.99,
    items: [
      { name: 'Pasta Bundle', quantity: 2, price: 9.99 },
      { name: 'Fresh Salad', quantity: 1, price: 7.50 }
    ],
    address: '123 Main St, City',
    phone: '+1 234 567 8901'
  },
  {
    id: 'ORD-12346',
    customerName: 'Jane Smith',
    date: '2023-07-20T11:45:00',
    status: 'ACCEPTED',
    totalAmount: 42.75,
    items: [
      { name: 'Sandwich Pack', quantity: 3, price: 12.99 }
    ],
    address: '456 Oak St, Town',
    phone: '+1 234 567 8902'
  },
  {
    id: 'ORD-12347',
    customerName: 'Mike Johnson',
    date: '2023-07-20T09:15:00',
    status: 'PREPARING',
    totalAmount: 15.99,
    items: [
      { name: 'Breakfast Bundle', quantity: 1, price: 11.99 },
      { name: 'Coffee', quantity: 2, price: 2.00 }
    ],
    address: '789 Pine St, Village',
    phone: '+1 234 567 8903'
  },
  {
    id: 'ORD-12348',
    customerName: 'Emily Brown',
    date: '2023-07-20T12:00:00',
    status: 'READY_FOR_PICKUP',
    totalAmount: 22.50,
    items: [
      { name: 'Lunch Box', quantity: 1, price: 14.50 },
      { name: 'Dessert', quantity: 2, price: 4.00 }
    ],
    address: '321 Elm St, Suburb',
    phone: '+1 234 567 8904'
  },
  {
    id: 'ORD-12349',
    customerName: 'David Wilson',
    date: '2023-07-20T13:30:00',
    status: 'IN_TRANSIT',
    totalAmount: 36.25,
    items: [
      { name: 'Family Meal', quantity: 1, price: 29.99 },
      { name: 'Side Dish', quantity: 2, price: 3.13 }
    ],
    address: '654 Maple St, District',
    phone: '+1 234 567 8905'
  },
  {
    id: 'ORD-12350',
    customerName: 'Sarah Miller',
    date: '2023-07-19T18:45:00',
    status: 'DELIVERED',
    totalAmount: 19.99,
    items: [
      { name: 'Dinner Special', quantity: 1, price: 17.99 },
      { name: 'Beverage', quantity: 1, price: 2.00 }
    ],
    address: '987 Cedar St, County',
    phone: '+1 234 567 8906'
  },
  {
    id: 'ORD-12351',
    customerName: 'Michael Davis',
    date: '2023-07-19T20:15:00',
    status: 'CANCELLED',
    totalAmount: 27.50,
    items: [
      { name: 'Party Pack', quantity: 1, price: 24.50 },
      { name: 'Dessert', quantity: 1, price: 3.00 }
    ],
    address: '159 Birch St, Borough',
    phone: '+1 234 567 8907'
  }
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState(mockOrders);
  
  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
  };
  
  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };
  
  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (activeTab !== 'all' && order.status !== activeTab) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchTermLower) ||
        order.customerName.toLowerCase().includes(searchTermLower)
      );
    }
    
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <Button variant="outline" size="sm" onClick={() => console.log("Refresh orders")}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="flex items-center space-x-2 max-w-[400px]">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders by ID or customer name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <div className="lg:w-[100%]">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Order List</CardTitle>
              <CardDescription>
                {filteredOrders.length} orders found
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    <TabsTrigger value="READY_FOR_PICKUP" className="py-2 px-1 text-[13px] md:text-md data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                      Ready
                    </TabsTrigger>
                    <TabsTrigger value="DELIVERED" className="py-2 px-1 text-[13px] md:text-md data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                      Delivered
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value={activeTab} className="m-0">
                  <OrderList 
                    orders={filteredOrders}
                    selectedOrderId={selectedOrder?.id}
                    onOrderSelect={handleOrderSelect}
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
    </div>
  );
}
