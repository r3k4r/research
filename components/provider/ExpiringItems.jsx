'use client';

import { useState, useEffect } from 'react';
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

export function ExpiringItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchExpiringItems() {
      try {
        const response = await fetch('/api/provider/expiringitems', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch expiring items');
        }
        
        const data = await response.json();
        setItems(data);
      } catch (err) {
        console.error('Error fetching expiring items:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchExpiringItems();
  }, []);

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
  
  if (loading) {
    return <div className="text-center py-6 text-sm text-muted-foreground">Loading expiring items...</div>;
  }
  
  if (error) {
    return <div className="text-center py-6 text-sm text-red-500">Error loading expiring items: {error}</div>;
  }
  
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
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.id.substring(0, 8).toUpperCase()}</p>
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
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => window.location.href = `/provider-dashboard/inventory/edit/${item.id}`}
                        >
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
