'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/components/ui/toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CartDrawer() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeItem, 
    updateItemQuantity, 
    clearCart,
    subtotal,
    isLoading 
  } = useCart();
  const router = useRouter();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartErrors, setCartErrors] = useState([]);

  // Ensure items is always an array for safe rendering
  const cartItems = Array.isArray(items) ? items : [];

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    
    setIsProcessing(true);
    setCartErrors([]);
    
    try {
      // Validate the cart with the API
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate cart');
      }
      
      // If any items need attention
      if (!data.valid) {
        // Process cart item updates
        const itemsToRemove = data.items.filter(item => item.remove);
        const itemsToAdjust = data.items.filter(item => item.adjust);
        
        // Remove invalid items
        itemsToRemove.forEach(item => {
          removeItem(item.id);
          showToast(`Removed: ${item.message}`, 'error');
        });
        
        // Show errors for items that need adjustment
        if (itemsToAdjust.length > 0) {
          setCartErrors(itemsToAdjust.map(item => ({
            id: item.id,
            message: item.message
          })));
          setIsProcessing(false);
          return;
        }
      }
      
      // Proceed to checkout
      router.push('/checkout');
      closeCart();
    } catch (error) {
      console.error('Error during checkout preparation:', error);
      showToast(error.message || 'Failed to prepare checkout', 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle adjusting quantities based on available stock
  const handleAdjustQuantity = (itemId, newQuantity) => {
    updateItemQuantity(itemId, newQuantity);
    setCartErrors(prev => prev.filter(error => error.id !== itemId));
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading your cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg">Your cart is empty</h3>
              <p className="text-muted-foreground mt-1">
                Add items to your cart to see them here
              </p>
              <Button 
                onClick={closeCart} 
                className="mt-4"
                variant="outline"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartErrors.length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Some items in your cart need attention
                  </AlertDescription>
                </Alert>
              )}

              {cartItems.map((item) => {
                const error = cartErrors.find(err => err.id === item.id);
                
                return (
                  <div key={item.id} className="flex items-start gap-4 py-3 border-b">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.provider}</p>
                      
                      {error && (
                        <p className="text-xs text-red-500 mt-1">{error.message}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => updateItemQuantity(item.id, (item.quantity || 1) - 1)}
                            disabled={item.quantity <= 1 || isProcessing}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity || 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => updateItemQuantity(item.id, (item.quantity || 1) + 1)}
                            disabled={isProcessing}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-sm font-medium">
                          {(item.price * (item.quantity || 1)).toFixed(2)} IQD
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {!isLoading && cartItems.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{subtotal.toFixed(2)} IQD</span>
            </div>
            
            <SheetFooter className="flex-col gap-2 sm:flex-col">
              <Button 
                onClick={handleCheckout}
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : 'Checkout'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={clearCart}
                disabled={isProcessing}
              >
                Clear Cart
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}