'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, MoreHorizontal, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data for expiring items
const mockExpiringItems = [
  {
    id: 'ITEM-1234',
    name: 'Artisan Bread Bundle',
    image: '/images/bread-bundle.jpg',
    currentPrice: 7.99,
    originalPrice: 12.99,
    quantity: 8,
    expiresAt: '2023-07-21T20:00:00',
    category: 'Bakery'
  },
  {
    id: 'ITEM-1235',
    name: 'Organic Vegetable Box',
    image: '/images/vegetable-box.jpg',
    currentPrice: 10.99,
    originalPrice: 17.99,
    quantity: 5,
    expiresAt: '2023-07-21T22:00:00',
    category: 'Produce'
  },
  {
    id: 'ITEM-1236',
    name: 'Pasta Special',
    image: '/images/pasta.jpg',
    currentPrice: 8.49,
    originalPrice: 13.99,
    quantity: 12,
    expiresAt: '2023-07-22T12:00:00',
    category: 'Ready Meals'
  },
  {
    id: 'ITEM-1237',
    name: 'Cheese Selection',
    image: '/images/cheese.jpg',
    currentPrice: 9.99,
    originalPrice: 14.99,
    quantity: 3,
    expiresAt: '2023-07-21T18:00:00',
    category: 'Dairy'
  },
  {
    id: 'ITEM-1238',
    name: 'Fresh Fruit Bowl',
    image: '/images/fruit-bowl.jpg',
    currentPrice: 6.99,
    originalPrice: 10.99,
    quantity: 7,
    expiresAt: '2023-07-21T16:00:00',
    category: 'Fruits'
  },
  {
    id: 'ITEM-1239',
    name: 'Sandwich Pack',
    image: '/images/sandwich-pack.jpg',
    currentPrice: 5.99,
    originalPrice: 8.99,
    quantity: 4,
    expiresAt: '2023-07-21T14:00:00',
    category: 'Ready-to-eat'
  }
];

export function ExpiringItems() {
  const [items] = useState(mockExpiringItems);

  // Calculate hours until expiration
  const getHoursUntilExpiration = (expiresAt) => {
    const now = new Date();
    const expiryDate = new Date(expiresAt);
    const diffInHours = Math.round((expiryDate - now) / (1000 * 60 * 60));
    
    return diffInHours;
  };
  
  // Get urgency className based on hours remaining
  const getUrgencyClass = (hours) => {
    if (hours < 6) return "text-red-600";
    if (hours < 12) return "text-amber-600";
    return "text-green-600";
  };
  
  // Format expiry time as a readable string
  const formatExpiryTime = (expiresAt) => {
    const hours = getHoursUntilExpiration(expiresAt);
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''}`;
  };
  
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-6">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium">No items expiring soon</h3>
          <p className="text-muted-foreground mt-1">
            Your inventory is in good condition
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="text-center">Expires in</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const hoursLeft = getHoursUntilExpiration(item.expiresAt);
                const urgencyClass = getUrgencyClass(hoursLeft);
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={`flex items-center justify-center gap-1 ${urgencyClass}`}>
                        <AlertCircle className="h-4 w-4" />
                        <span>{formatExpiryTime(item.expiresAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-medium">${item.currentPrice.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground line-through">
                          ${item.originalPrice.toFixed(2)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit item</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Increase discount</DropdownMenuItem>
                            <DropdownMenuItem>Mark as sold</DropdownMenuItem>
                            <DropdownMenuItem>Remove item</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
