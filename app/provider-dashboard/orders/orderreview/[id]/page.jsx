"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  Star,
  User,
  ShoppingBag,
  Truck,
  Calendar,
  Phone,
  MapPin,
  ChevronLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

const SingleReview = () => {
  const router = useRouter();
  const params = useParams();
  const reviewId = params.id;
  const { showToast, ToastComponent } = useToast();
  
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/provider/orders/reviews/${reviewId}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch review');
      }
      
      const data = await res.json();
      setReview(data);
    } catch (err) {
      console.error('Error loading review:', err);
      setError(err.message || 'An error occurred while fetching the review');
      showToast(err.message || 'Failed to load review details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch review data on page load
  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  // Helper function to format dates
  const formatDate = (dateString) => {
    return dateString ? format(new Date(dateString), 'PPpp') : 'N/A';
  };

  // Helper for review type badge color
  const getReviewTypeColor = (type) => {
    const colors = {
      'ITEM': 'bg-blue-100 text-blue-800',
      'DELIVERY': 'bg-green-100 text-green-800',
      'PREPARING': 'bg-yellow-100 text-yellow-800',
      'OTHERS': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Helper for order status badge color
  const getOrderStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'ACCEPTED': 'bg-blue-100 text-blue-800',
      'PREPARING': 'bg-cyan-100 text-cyan-800',
      'READY_FOR_PICKUP': 'bg-indigo-100 text-indigo-800',
      'IN_TRANSIT': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-[70vh]">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <Button onClick={fetchReview}>Try Again</Button>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-[70vh]">
        <div className="text-gray-500 text-xl mb-4">Review not found</div>
        <Button onClick={() => router.push('/provider-dashboard/orders/orderreview')}>
          Back to Reviews
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {ToastComponent}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/provider-dashboard/orders/orderreview')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Reviews
          </Button>
          <h1 className="text-2xl font-bold">Review Details</h1>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchReview}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Review Summary */}
        <Card className="col-span-1 md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Review Summary</CardTitle>
              <CardDescription>
                Submitted on {formatDate(review.createdAt)}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="font-bold">{review.rating}/5</span>
              <Badge className={getReviewTypeColor(review.type)}>
                {review.type === 'ITEM' ? 'Food Quality' : 
                 review.type === 'DELIVERY' ? 'Delivery Service' : 
                 review.type === 'PREPARING' ? 'Food Preparation' : 'Other'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="italic text-gray-700">{review.comment || 'No comment provided'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Reviewer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Reviewer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              {review.user.image ? (
                <div className="relative h-16 w-16 mr-4 rounded-full overflow-hidden">
                  <Image
                    src={review.user.image}
                    alt={review.user.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 mr-4 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{review.user.name}</h3>
              </div>
            </div>
            
            <div className="space-y-2">
              {review.user.phoneNumber && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{review.user.phoneNumber}</span>
                </div>
              )}
              {review.user.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{review.user.location}</span>
                </div>
              )}
              {review.user.gender && (
                <div className="flex items-center">
                  <span className="w-4 mr-2 text-gray-500">⚥</span>
                  <span className="capitalize">{review.user.gender}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Food Item Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Food Item Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex mb-4">
              {review.foodItem.image ? (
                <div className="relative h-24 w-24 mr-4 rounded-lg overflow-hidden">
                  <Image
                    src={review.foodItem.image}
                    alt={review.foodItem.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 mr-4 rounded-lg bg-gray-200 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-gray-500" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{review.foodItem.name}</h3>
                <Badge>{review.foodItem.category}</Badge>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="font-bold">${review.foodItem.discountedPrice.toFixed(2)}</span>
                  {review.foodItem.price !== review.foodItem.discountedPrice && (
                    <span className="text-gray-500 line-through">${review.foodItem.price.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-3">
              <h4 className="font-medium">Description</h4>
              <p className="text-sm text-gray-600">{review.foodItem.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Information & Delivery Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {review.order ? (
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Order ID:</span>
                  <p className="font-medium">{review.order.id}</p>
                </div>

                <div className='flex items-center gap-2'>
                  <span className="text-sm text-gray-500">Status:</span>
                  <Badge className={getOrderStatusColor(review.order.status)}>
                    {review.order.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className='flex items-center gap-2'>
                  <span className="text-sm text-gray-500">Total Amount:</span>
                  <p className="font-medium">${review.order.totalAmount.toFixed(2)}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Delivery Address:</span>
                  <p className="font-medium">{review.order.deliveryAddress}</p>
                </div>

                {review.order.deliveryNotes && (
                  <div>
                    <span className="text-sm text-gray-500">Delivery Notes:</span>
                    <p className="font-medium">{review.order.deliveryNotes}</p>
                  </div>
                )}

                <div>
                  <span className="text-sm text-gray-500">Payment Method:</span>
                  <p className="font-medium capitalize">{review.order.paymentMethod}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Order Timeline
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Order Placed:</span>
                      <span>{formatDate(review.order.createdAt)}</span>
                    </div>
                    
                    {review.order.statusLogs && review.order.statusLogs.length > 0 ? (
                      <div className="pl-2 border-l-2 border-gray-200 space-y-4 mt-3">
                        {review.order.statusLogs.map((log, index) => (
                          <div key={log.id} className="relative">
                            <div className="absolute -left-[17px] h-3 w-3 rounded-full bg-primary"></div>
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                <Badge className={getOrderStatusColor(log.status)}>
                                  {log.status.replace(/_/g, ' ')}
                                </Badge>
                                {log.notes && (
                                  <p className="text-xs text-gray-500 mt-1">{log.notes}</p>
                                )}
                              </div>
                              <span className="text-gray-500">{formatDate(log.createdAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No status updates available</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No order information available for this review</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SingleReview;