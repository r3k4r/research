'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { format } from 'date-fns';
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard, 
  ChevronDown, 
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  Star,
  Check
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReviewDialog from '@/components/ReviewDialog';
import { useToast } from '@/components/ui/toast';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedTab, setSelectedTab] = useState('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewingOrderId, setReviewingOrderId] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { showToast, ToastComponent } = useToast();

  // Fetch orders
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/api/auth/signin?callbackUrl=/orderhistory');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchOrders();
    }
  }, [sessionStatus, currentPage, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orderhistory?page=${currentPage}&limit=8&t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }
      
      const data = await response.json();
      setOrders(data.orders);
      setTotalPages(data.pagination.pages);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orders.length > 0) {
      console.log("First order structure:", orders[0]);
      console.log("First order items:", orders[0].items);
      if (orders[0].items.length > 0) {
        console.log("First item of first order:", orders[0].items[0]);
        console.log("foodItemId from first item:", orders[0].items[0].foodItemId);
      }
    }
  }, [orders]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US') + ' IQD';
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      setIsSubmittingReview(true);
      
      // Log the review data being sent
      console.log('Submitting review with data:', reviewData);

      // Update the UI optimistically to improve perceived performance
      setOrders(prevOrders => prevOrders.map(order => {
        if (order.id === reviewingOrderId) {
          return {...order, isReviewed: true};
        }
        return order;
      }));
      
      // Close the modal immediately to improve UX
      setReviewModalOpen(false);
      
      // Show an optimistic success message
      showToast('Submitting review...', 'loading');
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
        // Add cache control to prevent caching issues
        cache: 'no-store'
      });
      
      // Log the full response for debugging
      console.log('Review submission response status:', response.status);
      
      let data;
      try {
        // Parse response body, but handle possible parsing errors
        const textData = await response.text();
        console.log('Raw response:', textData);
        data = textData ? JSON.parse(textData) : {};
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        data = {};
      }
      
      // Even if there's an error, we've already updated the UI
      // This prevents the error toast from showing in production when the review is actually submitted
      if (!response.ok) {
        console.error('Server returned error:', data.error || response.statusText);
        // We don't throw an error here - just log it
      } else {
        // If everything is good, show success message
        showToast('Review submitted successfully', 'success');
      }
      
    } catch (error) {
      console.error('Error submitting review:', error);
      // Don't revert the UI change - the review might have been submitted despite the error
      showToast('Error occurred, but your review may have been submitted. Please refresh to confirm.', 'warning');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleOpenReviewModal = (order, item) => {
    if (order && order.items && order.items.length > 0) {
      // Get the first item or the selected item
      const selectedItem = item || order.items[0];
      
      
      // Make sure we have both id fields
      const itemToReview = {
        foodItemId: selectedItem.foodItemId,
        id: selectedItem.id,
        name: selectedItem.name
      };
      
      
      setReviewingItem(itemToReview);
      setReviewingOrderId(order.id);
      setReviewModalOpen(true);
    } else {
      showToast('Cannot review this order: no items found', 'error');
    }
  };

  // Filter and sort orders
  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false;
    }

    if (selectedTab === 'delivered' && order.status !== 'DELIVERED') {
      return false;
    }
    
    if (selectedTab === 'cancelled' && order.status !== 'CANCELLED') {
      return false;
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const orderIdMatches = order.id.toLowerCase().includes(searchLower);
      const providerMatches = order.provider.toLowerCase().includes(searchLower);
      const itemMatches = order.items.some(item => 
        item.name.toLowerCase().includes(searchLower)
      );
      
      return orderIdMatches || providerMatches || itemMatches;
    }
    
    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'total-desc':
        return b.total - a.total;
      case 'total-asc':
        return a.total - b.total;
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="mr-1 h-3 w-3" />
            Delivered
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const renderOrderActions = (order) => {
    if (order.status === 'DELIVERED' && !order.isReviewed) {
      return (
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={() => handleOpenReviewModal(order, order.items[0])}
            variant="outline" 
            size="sm"
            className="text-primary border-primary hover:bg-primary/10"
          >
            <Star className="h-4 w-4 mr-1" /> Leave a Review
          </Button>
        </div>
      );
    }
    
    if (order.status === 'DELIVERED' && order.isReviewed) {
      return (
        <div className="mt-4 flex justify-end">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3 mr-1" /> Reviewed
          </Badge>
        </div>
      );
    }
    
    return null;
  };

  if (sessionStatus === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>

        <Tabs 
          defaultValue="all" 
          value={selectedTab} 
          onValueChange={setSelectedTab} 
          className="mb-6"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search orders by ID, restaurant or item..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest first</SelectItem>
                    <SelectItem value="date-asc">Oldest first</SelectItem>
                    <SelectItem value="total-desc">Highest amount</SelectItem>
                    <SelectItem value="total-asc">Lowest amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex justify-between mb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <Button className="mt-4" onClick={fetchOrders}>Try again</Button>
              </div>
            ) : sortedOrders.length === 0 ? (
              <div className="text-center py-16 border rounded-lg bg-gray-50 dark:bg-dark10">
                <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No orders found</h3>
                <p className="text-muted-foreground mt-1">
                  {searchTerm ? 
                    "Try adjusting your search or filters" : 
                    "Your order history will appear here"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedOrders.map((order) => (
                  <Card key={order.id} className={`overflow-hidden transition-all duration-200`}>
                    <div 
                      className={`p-6 cursor-pointer ${expandedOrderId === order.id ? 'bg-gray-50' : ''}`}
                      onClick={() => toggleOrderDetails(order.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Order #{order.id.substring(0, 8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            <Calendar className="inline-block w-4 h-4 mr-1 -mt-0.5" />
                            {formatDate(order.date)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          {getStatusBadge(order.status)}
                          <span className="text-sm font-medium mt-1">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                          {order.providerLogo ? (
                            <Image
                              src={order.providerLogo}
                              alt={order.provider}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-lg font-medium">
                              {order.provider.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{order.provider}</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                        
                        <div className="ml-auto">
                          {expandedOrderId === order.id ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {expandedOrderId === order.id && (
                      <div className="px-6 pb-6">
                        <Separator className="mb-4" />
                        
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-2">Order Details</h4>
                            <ul className="space-y-2">
                              {order.items.map((item, index) => (
                                <li key={index} className="flex justify-between text-sm">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span className="text-muted-foreground">
                                    {formatCurrency(item.price * item.quantity)}
                                  </span>
                                </li>
                              ))}
                              
                              <li className="pt-2 mt-2 border-t">
                                <div className="flex justify-between text-sm">
                                  <span>Subtotal</span>
                                  <span className="text-muted-foreground">{formatCurrency(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                  <span>Delivery Fee</span>
                                  <span className="text-muted-foreground">{formatCurrency(order.deliveryFee)}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                  <span>Service Fee</span>
                                  <span className="text-muted-foreground">{formatCurrency(order.serviceFee)}</span>
                                </div>
                                <div className="flex justify-between font-medium pt-2 mt-2 border-t">
                                  <span>Total</span>
                                  <span>{formatCurrency(order.total)}</span>
                                </div>
                              </li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Delivery Information</h4>
                            <div className="space-y-2">
                              <p className="text-sm">
                                <MapPin className="inline-block w-4 h-4 mr-1 -mt-0.5" />
                                <span className="text-muted-foreground">Delivery Address: </span>
                                {order.deliveryAddress}
                              </p>
                              
                              {order.deliveryNotes && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Notes: </span>
                                  {order.deliveryNotes}
                                </p>
                              )}
                              
                              <p className="text-sm">
                                <CreditCard className="inline-block w-4 h-4 mr-1 -mt-0.5" />
                                <span className="text-muted-foreground">Paid with: </span>
                                {order.paymentMethod}
                              </p>
                            </div>
                            
                            {order.timeline && order.timeline.length > 0 && (
                              <div className="mt-6">
                                <h4 className="font-medium mb-2">Order Timeline</h4>
                                <div className="space-y-2">
                                  {order.timeline.slice(0, 3).map((event, index) => (
                                    <div key={index} className="text-sm">
                                      <span className="text-muted-foreground">{formatDate(event.date)}</span>
                                      <p>
                                        <span className="font-medium">{event.status.replace(/_/g, ' ')}</span>
                                        {event.notes && <span className="ml-1">- {event.notes}</span>}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {renderOrderActions(order)}
                      </div>
                    )}
                  </Card>
                ))}
                
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous page</span>
                      </Button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(i + 1)}
                          className="w-9"
                        >
                          {i + 1}
                        </Button>
                      ))}
                      
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">Next page</span>
                        </Button>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <ReviewDialog
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        foodItem={reviewingItem}
        orderId={reviewingOrderId}
        isSubmitting={isSubmittingReview}
      />
      {ToastComponent}
    </>
  );
};

export default OrderHistoryPage;