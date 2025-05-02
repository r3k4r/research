"use client";

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, MapPin, Clock, Package, Calendar, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SingleCustomer = ({ params }) => {
  const { id } = params;
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/provider/customers/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch customer data');
        }
        
        const data = await response.json();
        setCustomer(data.customer);
        setOrders(data.orders);
      } catch (err) {
        console.error('Error fetching customer data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const goBack = () => {
    router.push('/provider-dashboard/customers');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-destructive font-medium">Error: {error}</div>
        <Button onClick={goBack} variant="outline">Back to Customers</Button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-muted-foreground">Customer not found</div>
        <Button onClick={goBack} variant="outline">Back to Customers</Button>
      </div>
    );
  }

  const getOrderStatusBadge = (status) => {
    const statusStyles = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'ACCEPTED': 'bg-blue-100 text-blue-800 border-blue-300',
      'PREPARING': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'READY_FOR_PICKUP': 'bg-purple-100 text-purple-800 border-purple-300',
      'IN_TRANSIT': 'bg-orange-100 text-orange-800 border-orange-300',
      'DELIVERED': 'bg-green-100 text-green-800 border-green-300',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-300',
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goBack}
            className="h-9 w-9 p-0 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Go back</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Customer Details</h1>
        </div>
        <div>
          <Badge variant="outline" className="text-sm">
            Customer since {formatDate(customer.joinedAt).split(',')[0] +" " + formatDate(customer.joinedAt).split(',')[1]}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Profile</CardTitle>
          <CardDescription>View customer information and order history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start gap-4 md:w-1/3">
              <Avatar className="h-24 w-24">
                {customer.image ? (
                  <AvatarImage src={customer.image} alt={customer.name} />
                ) : null}
                <AvatarFallback className="text-2xl">
                  {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold">{customer.name}</h2>
                {customer.email && (
                  <p className="text-muted-foreground">{customer.email}</p>
                )}
              </div>
              <div className="space-y-3 w-full">
                {customer.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phoneNumber}</span>
                  </div>
                )}
                {customer.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.totalOrders || orders.length} Orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Last order: {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <Separator orientation="vertical" className="h-auto hidden md:block" />
            <Separator className="my-4 md:hidden" />
            
            <div className="md:w-2/3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Total Spent</div>
                    <div className="text-2xl font-bold mt-1">
                      {formatCurrency(customer.totalSpent || 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Average Order</div>
                    <div className="text-2xl font-bold mt-1">
                      {formatCurrency(customer.totalOrders ? (customer.totalSpent / customer.totalOrders) : 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Recent Orders</div>
                    <div className="text-2xl font-bold mt-1">
                      {orders.filter(order => 
                        ['PENDING', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'IN_TRANSIT'].includes(order.status)
                      ).length}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="orders">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="items">Purchased Items</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>All orders placed by this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No order history found for this customer.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="hidden sm:table-cell">Items</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell className="hidden sm:table-cell">{order.items.length}</TableCell>
                          <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="items" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchased Items</CardTitle>
              <CardDescription>Details of items purchased by this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No purchased items found for this customer.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="hidden sm:table-cell">Order ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.flatMap(order => 
                        order.items.map((item, index) => (
                          <TableRow key={`${order.id}-${index}`}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-muted-foreground sm:hidden">
                                  Order: {order.id.substring(0, 8)}...
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                {formatDate(order.createdAt).split(',')[0]}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                              {order.id.substring(0, 8)}...
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SingleCustomer;