'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useToast } from './ui/toast';

export function FoodCard({
  id,
  name,
  description,
  image,
  originalPrice,
  discountedPrice,
  provider,
  providerId,
  providerLogo,
  category,
  expiresIn,
  quantity,
}) {
  const discount = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = () => {
    setIsLoading(true);
    
    // Add item to cart
    addItem({
      id,
      name,
      image,
      price: discountedPrice,
      provider,
      providerId,
    });
    
    // Show toast notification
    showToast(`${name} has been added to your cart.`, "success");
    
    setIsLoading(false);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
        {/* Provider overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={providerLogo}
                alt={provider}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-white text-md font-medium">{provider}</span>
          </div>
        </div>
      </div>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{name}</h3>
          <Badge variant="secondary">{category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        <div className="flex items-end justify-between mb-3">
          <div className="space-y-1 flex items-center justify-center gap-4">
            <p className="text-sm line-through text-muted-foreground">{originalPrice.toFixed(2)} IQD</p>
            <p className="text-lg font-semibold text-primary">{discountedPrice.toFixed(2)} IQD</p>
          </div>
          <Badge variant="outline" className="text-orange-600">
            {
              expiresIn === 'Expired' ? 'Expired' : `Expires in ${expiresIn}`
            }
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <ShoppingCart size={16} />
          {isLoading ? 'Adding...' : 'Add to cart'}
        </Button>
        <Badge variant="outline" className="bg-gray-100 text-gray-600">
          {quantity} left
        </Badge>
      </CardFooter>
    </Card>
  );
}