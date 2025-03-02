'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function FoodCard({
  name,
  description,
  image,
  originalPrice,
  discountedPrice,
  provider,
  providerLogo,
  category,
  expiresIn,
}) {
  const discount = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);

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
        <div className="flex items-end justify-between">
          <div className="space-y-1 flex items-center justify-center gap-4">
            <p className="text-sm line-through text-muted-foreground">${originalPrice.toFixed(2)}</p>
            <p className="text-lg font-semibold text-primary">${discountedPrice.toFixed(2)}</p>
          </div>
          <Badge variant="outline" className="text-orange-600">
            Expires in {expiresIn}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}