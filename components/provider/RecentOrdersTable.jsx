'use client';

import { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function RecentOrdersTable({ extended = false }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();
  
  useEffect(() => {
    async function fetchOrders() {
      try {
        const limit = extended ? 20 : 5;
        const response = await fetch(`/api/provider/recentorders?limit=${limit}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrders();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); 
    
    return () => clearInterval(timer);
  }, [extended]);
  
  const displayedOrders = extended ? orders : orders.slice(0, 5);
  
  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, currentTime, { addSuffix: true });
    } catch (err) {
      console.error('Error formatting time:', err);
      return 'Unknown time';
    }
  };

  const viewAllOrdersHandler = () => {
    router.push('/provider-dashboard/orders');
  }

  if (loading) {
    return <div className="w-full py-4 text-center text-sm text-muted-foreground">Loading orders...</div>;
  }

  if (error) {
    return <div className="w-full py-4 text-center text-sm text-red-500">Error loading orders: {error}</div>;
  }

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              {extended && <TableHead className="hidden md:table-cell">Date</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              {extended && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={extended ? 6 : 4} className="text-center py-6 text-muted-foreground">
                  No recent orders found
                </TableCell>
              </TableRow>
            ) : (
              displayedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id.substring(0, 8).toUpperCase()}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  {extended && (
                    <TableCell className="hidden md:table-cell">
                      {formatTimeAgo(order.date)}
                    </TableCell>
                  )}
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">{order.amount.toFixed(2)} IQD</TableCell>
                  {extended && (
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => router.push(`/provider-dashboard/orders/${order.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View order details</span>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
        <div className="mt-4 text-left">
          <Button variant="outline" size="sm" onClick={viewAllOrdersHandler}>
            View All Orders
          </Button>
        </div>
    </div>
  );
}
