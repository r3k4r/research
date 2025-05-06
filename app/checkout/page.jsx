'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, subtotal, clearCart, isLoading, itemsByProvider } = useCart();
  const { showToast, ToastComponent } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);
  
  // Ensure items is always an array
  const cartItems = Array.isArray(items) ? items : [];
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryNotes: '',
    paymentMethod: 'cash',
  });

  // Populate user data if available
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || prev.name,
      }));
    }
  }, [session]);

  // Redirect if cart is empty (after checking it's loaded)
  useEffect(() => {
    if (!isLoading && cartItems.length === 0 && typeof window !== 'undefined') {
      router.push('/');
    }
  }, [isLoading, cartItems.length, router]);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      showToast('Please sign in to checkout', 'error');
      router.push('/api/auth/signin?callbackUrl=/checkout');
    }
  }, [status, router, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value) => {
    setFormData(prev => ({ ...prev, paymentMethod: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);
    
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    
    // Validate form
    if (!formData.name || !formData.phone || !formData.address) {
      setValidationError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First validate the cart to ensure items are still available
      const validateResponse = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems }),
      });
      
      const validateData = await validateResponse.json();
      
      if (!validateResponse.ok) {
        throw new Error(validateData.error || 'Failed to validate cart');
      }
      
      if (!validateData.valid) {
        setValidationError('Some items in your cart are no longer available. Please return to cart to update.');
        setIsSubmitting(false);
        return;
      }
      
      // Process the order
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          deliveryInfo: formData,
          paymentMethod: formData.paymentMethod,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }
      
      // Show success message
      showToast('Order placed successfully!', 'success');
      
      // Clear the cart
      clearCart();
      
      // Redirect to orders page after successful checkout
      router.push('/orders');
      
    } catch (error) {
      console.error('Error placing order:', error);
      showToast(error.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2">Loading checkout information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total with fees
  const deliveryFee = 2500;
  const serviceFee = 500;
  const total = subtotal + deliveryFee + serviceFee;

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        
        {validationError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Delivery Information */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea 
                      id="address" 
                      name="address" 
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
                    <Textarea 
                      id="deliveryNotes" 
                      name="deliveryNotes"
                      value={formData.deliveryNotes}
                      onChange={handleChange}
                      placeholder="Any special instructions for delivery"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <RadioGroup 
                      defaultValue="cash"
                      value={formData.paymentMethod}
                      onValueChange={handleRadioChange}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash">Cash on Delivery</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {itemsByProvider.map((providerGroup, index) => (
                  <div key={providerGroup.providerId || index} className="mb-4">
                    <h3 className="font-medium text-sm border-b pb-2 mb-2">
                      {providerGroup.providerName}
                    </h3>
                    {providerGroup.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-2 border-b">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity || 1} x {item.price.toFixed(2)} IQD
                          </p>
                        </div>
                        <p className="font-medium">
                          {((item.quantity || 1) * item.price).toFixed(2)} IQD
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
                
                <div className="flex justify-between pt-2">
                  <p className="font-medium">Subtotal</p>
                  <p className="font-medium">{subtotal.toFixed(2)} IQD</p>
                </div>
                
                <div className="flex justify-between">
                  <p className="font-medium">Delivery Fee</p>
                  <p className="font-medium">{deliveryFee.toFixed(2)} IQD</p>
                </div>
                
                <div className="flex justify-between">
                  <p className="font-medium">Service Fee</p>
                  <p className="font-medium">{serviceFee.toFixed(2)} IQD</p>
                </div>
                
                <div className="flex justify-between pt-2 border-t">
                  <p className="font-bold">Total</p>
                  <p className="font-bold">{total.toFixed(2)} IQD</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit"
                  form="checkout-form"
                  className="w-full"
                  disabled={isSubmitting || cartItems.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      {ToastComponent}
    </div>
  );
}