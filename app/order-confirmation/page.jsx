'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function OrderConfirmationPage() {
  const router = useRouter();
  
  // Redirect to home if accessed directly without placing an order
  useEffect(() => {
    const hasPlacedOrder = sessionStorage.getItem('orderPlaced');
    if (!hasPlacedOrder && typeof window !== 'undefined') {
      router.push('/');
    } else {
      // Set flag to prevent direct access
      sessionStorage.setItem('orderPlaced', 'true');
      
      // Clear the flag after 5 minutes
      const timer = setTimeout(() => {
        sessionStorage.removeItem('orderPlaced');
      }, 5 * 60 * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Thank you for your order. Your order has been received and is now being processed.
              </p>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm">Order ID: #ORD-{Math.floor(100000 + Math.random() * 900000)}</p>
                <p className="text-sm mt-1">Estimated delivery time: 30-45 minutes</p>
              </div>
              <p className="text-sm text-muted-foreground">
                You will receive updates about your order status. The delivery person will contact you when they're on the way.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center space-x-4">
              <Button asChild variant="outline">
                <Link href="/orders">View My Orders</Link>
              </Button>
              <Button asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}