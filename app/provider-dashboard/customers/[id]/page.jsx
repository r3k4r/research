"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { 
  ArrowLeft, 
  User,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag, 
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function SingleCustomerPage({ params }) {
  const router = useRouter();
  const { id: customerId } = params;
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        
        // Add timestamp to prevent caching
        const timestamp = Date.now();
        const response = await fetch(`/api/provider/customers/${customerId}?t=${timestamp}`, {
          cache: 'no-store',
          next: { revalidate: 0 },
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch customer details');
        }

        const data = await response.json();
        setCustomer(data);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        showToast(err.message || 'Failed to load customer details', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId, showToast]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date with time for display
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get status badge color based on status
  const getStatusBadge = (status) => {
    const statusStyles = {
      "PENDING": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "ACCEPTED": "bg-blue-100 text-blue-800 border-blue-300",
      "PREPARING": "bg-purple-100 text-purple-800 border-purple-300",
      "READY_FOR_PICKUP": "bg-indigo-100 text-indigo-800 border-indigo-300",
      "IN_TRANSIT": "bg-orange-100 text-orange-800 border-orange-300",
      "DELIVERED": "bg-green-100 text-green-800 border-green-300",
      "CANCELLED": "bg-red-100 text-red-800 border-red-300"
    };
    
    return (
      <Badge variant="outline" className={`${statusStyles[status] || "bg-gray-100 text-gray-800"}`}>
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 min-h-[60vh]">
        <p className="text-red-500">Error: {error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 min-h-[60vh]">
        <p className="text-muted-foreground">Customer not found</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const { profile, statistics, orders } = customer;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Customer Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Profile */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <Avatar className="h-20 w-20">
                {profile.image ? (
                  <AvatarImage src={profile.image} alt={profile.name} />
                ) : null}
                <AvatarFallback className="text-xl">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'C'}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{profile.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone Number</p>
                <p className="text-sm text-muted-foreground">{profile.phoneNumber}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{profile.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">First Order</p>
                <p className="text-sm text-muted-foreground">
                  {statistics.firstOrderDate ? formatDate(statistics.firstOrderDate) : 'N/A'}
                </p>
              </div>
            </div>
            <div className="pt-4 space-y-2 border-t">
              <h3 className="text-sm font-medium">Customer Summary</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-secondary/30 rounded-md text-center">
                  <p className="text-2xl font-bold">{statistics.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-md text-center">
                  <p className="text-2xl font-bold">{formatCurrency(statistics.totalSpent)}</p>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
              </div>
            </div>
            {statistics.favoriteItems.length > 0 && (
              <div className="pt-4 space-y-2 border-t">
                <h3 className="text-sm font-medium">Favorite Items</h3>
                <div className="space-y-2">
                  {statistics.favoriteItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm p-2 bg-secondary/20 rounded-md">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{item.count}x</span>
                        <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order History */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>
              This customer has placed {statistics.totalOrders} orders with you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-6">
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No orders found</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      formatCurrency={formatCurrency}
                      formatDateTime={formatDateTime}
                      getStatusBadge={getStatusBadge}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="active" className="space-y-6">
                {orders.filter(order => 
                  ["PENDING", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP", "IN_TRANSIT"].includes(order.status)
                ).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No active orders</p>
                  </div>
                ) : (
                  orders
                    .filter(order => 
                      ["PENDING", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP", "IN_TRANSIT"].includes(order.status)
                    )
                    .map((order) => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        formatCurrency={formatCurrency}
                        formatDateTime={formatDateTime}
                        getStatusBadge={getStatusBadge}
                      />
                    ))
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="space-y-6">
                {orders.filter(order => 
                  ["DELIVERED", "CANCELLED"].includes(order.status)
                ).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No completed orders</p>
                  </div>
                ) : (
                  orders
                    .filter(order => 
                      ["DELIVERED", "CANCELLED"].includes(order.status)
                    )
                    .map((order) => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        formatCurrency={formatCurrency}
                        formatDateTime={formatDateTime}
                        getStatusBadge={getStatusBadge}
                      />
                    ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {ToastComponent}
    </div>
  );
}

// Order Card Component
function OrderCard({ order, formatCurrency, formatDateTime, getStatusBadge }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Order #{order.id.substring(0, 8)}</span>
          </div>
          {getStatusBadge(order.status)}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDateTime(order.createdAt)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items:</span>
            <span>{order.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total:</span>
            <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
        
        {expanded && (
          <div className="pt-3 space-y-4 border-t mt-3">
            <div>
              <h4 className="text-sm font-medium mb-2">Order Items</h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm p-2 bg-secondary/20 rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-xs text-muted-foreground">{item.product.category}</div>
                    </div>
                    <div className="text-right">
                      <div>{formatCurrency(item.price)} x {item.quantity}</div>
                      <div className="font-medium">{formatCurrency(item.subtotal)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Delivery Address</h4>
              <p className="text-sm">{order.deliveryAddress}</p>
              {order.deliveryNotes && (
                <p className="text-sm text-muted-foreground mt-1">
                  Note: {order.deliveryNotes}
                </p>
              )}
            </div>
            
            {order.statusLogs && order.statusLogs.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Order Timeline</h4>
                <div className="space-y-3">
                  {order.statusLogs.map((log, index) => (
                    <div key={index} className="flex gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className="font-medium">{log.status.replace(/_/g, ' ')}</span>
                          <span className="text-muted-foreground">
                            {formatDateTime(log.createdAt)}
                          </span>
                        </div>
                        {log.notes && <p className="text-muted-foreground">{log.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-2 border-t">
        <Button variant="ghost" size="sm" className="w-full" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show Less" : "View Details"}
        </Button>
      </CardFooter>
    </Card>
  );
}