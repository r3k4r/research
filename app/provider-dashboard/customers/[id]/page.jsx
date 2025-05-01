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
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Mail, 
  Calendar, 
  DollarSign, 
  ShoppingBag,
  Loader2,
  Package,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function CustomerDetailsPage({ params }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast, ToastComponent } = useToast();
  const router = useRouter();
  
  const customerId = params.id;
  

  useEffect(() => {
    if (!customerId) {
      setError("Missing customer ID");
      setLoading(false);
      return;
    }
    
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(`/api/provider/customers/${customerId}`, {
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        });
        
        clearTimeout(timeoutId);
        
        const responseText = await response.text();
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          console.error('Response Text:', responseText);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }
        
        if (!response.ok) {
          const errorMessage = responseData?.error || `Server responded with status: ${response.status}`;
          const detailedMessage = responseData?.message || '';
          console.error('API Error:', { status: response.status, error: errorMessage, details: detailedMessage });
          throw new Error(errorMessage);
        }
        
        if (!responseData) {
          throw new Error('Empty response received from server');
        }
        
        setCustomer(responseData);
      } catch (err) {
        console.error('Error fetching customer details:', err);
        if (err.name === 'AbortError') {
          setError('Request timed out. The server took too long to respond.');
        } else {
          setError(err.message || 'Failed to load customer details');
        }
        showToast('Error loading customer data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [customerId]);

  const goBack = () => {
    router.back();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
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
    }).format(amount || 0);
  };

  const getOrderStatusBadge = (status) => {
    const statusMap = {
      PENDING: { color: "warning", label: "Pending" },
      PROCESSING: { color: "info", label: "Processing" },
      COMPLETED: { color: "success", label: "Completed" },
      CANCELLED: { color: "destructive", label: "Cancelled" },
      REFUNDED: { color: "default", label: "Refunded" },
      SHIPPED: { color: "secondary", label: "Shipped" }
    };

    const statusInfo = statusMap[status] || { color: "secondary", label: status };

    return <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading customer data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button onClick={goBack} variant="outline" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Customer</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="flex flex-col items-center justify-center p-8">
              <p className="text-muted-foreground mb-4 text-center">
                There was a problem loading the customer data. This might be due to an invalid customer ID or server issues.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
                <Button onClick={goBack}>
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {ToastComponent}
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Button onClick={goBack} variant="outline" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-bold">Customer not found</h2>
            <p className="text-muted-foreground mb-4">This customer doesn't exist or you don't have permission to view it.</p>
            <Button onClick={goBack}>
              Go Back
            </Button>
          </CardContent>
        </Card>
        {ToastComponent}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button onClick={goBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-7">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Customer since {formatDate(customer.createdAt)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Customer Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                {customer.image ? (
                  <AvatarImage src={customer.image} alt={customer.name} />
                ) : null}
                <AvatarFallback className="text-2xl">
                  {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold">{customer.name}</h2>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{customer.phoneNumber || 'No phone number'}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{customer.location || 'No location provided'}</span>
              </div>
              {customer.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="break-all">{customer.email}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary rounded-md p-3">
                <p className="text-muted-foreground text-xs mb-1 flex items-center">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  Orders
                </p>
                <p className="text-xl font-bold">{customer.totalOrders}</p>
              </div>

              <div className="bg-secondary rounded-md p-3">
                <p className="text-muted-foreground text-xs mb-1 flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Total Spent
                </p>
                <p className="text-xl font-bold">{formatCurrency(customer.totalSpent)}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">First Order:</span>
                <span>{formatDate(customer.firstOrderDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Latest Order:</span>
                <span>{formatDate(customer.lastOrderDate)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>
              {customer.totalOrders} total orders from this customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customer.orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="mx-auto h-12 w-12 opacity-20 mb-2" />
                <p>No orders found for this customer</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {customer.orders.map((order, index) => (
                  <AccordionItem 
                    key={order.id} 
                    value={`order-${order.id}`} 
                    className="border bg-card rounded-lg shadow-sm"
                  >
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                      <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-2 text-left">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Order #{order.id.substring(0, 8)}</span>
                            {getOrderStatusBadge(order.status)}
                          </div>
                          <span className="text-sm text-muted-foreground flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDateTime(order.createdAt)}
                          </span>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {order.items.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{item.product.name}</div>
                                      <div className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[300px]">
                                        {item.product.description}
                                      </div>
                                      {item.product.category && (
                                        <Badge variant="outline" className="mt-1 text-xs">
                                          {item.product.category}
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">{item.quantity}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(item.product.price)}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        
                        <div className="bg-secondary/50 p-3 rounded-md flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div className="flex items-center text-sm">
                            <Package className="h-4 w-4 mr-2" />
                            <span>
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </span>
                          </div>
                          <div className="flex items-center font-medium">
                            <span className="text-muted-foreground mr-2">Order Total:</span>
                            <span>{formatCurrency(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
      {ToastComponent}
    </div>
  );
}
