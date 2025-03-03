'use client';

import { useState } from 'react';
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

// Mock data for recent orders
const mockOrders = [
  {
    id: 'ORD-5392',
    customer: 'John Doe',
    date: '2023-07-20T14:45:00',
    status: 'DELIVERED',
    amount: 29.99,
  },
  {
    id: 'ORD-5391',
    customer: 'Jane Smith',
    date: '2023-07-20T13:30:00',
    status: 'IN_TRANSIT',
    amount: 42.50,
  },
  {
    id: 'ORD-5390',
    customer: 'Mike Johnson',
    date: '2023-07-20T12:15:00',
    status: 'READY_FOR_PICKUP',
    amount: 18.75,
  },
  {
    id: 'ORD-5389',
    customer: 'Emily Wilson',
    date: '2023-07-20T11:00:00',
    status: 'PREPARING',
    amount: 35.25,
  },
  {
    id: 'ORD-5388',
    customer: 'David Brown',
    date: '2023-07-20T10:30:00',
    status: 'ACCEPTED',
    amount: 24.99,
  },
  {
    id: 'ORD-5387',
    customer: 'Sarah Miller',
    date: '2023-07-20T09:45:00',
    status: 'PENDING',
    amount: 15.50,
  },
  {
    id: 'ORD-5386',
    customer: 'Michael Davis',
    date: '2023-07-19T18:30:00',
    status: 'CANCELLED',
    amount: 27.75,
  }
];

export function RecentOrdersTable({ extended = false }) {
  const [orders] = useState(mockOrders);
  
  // For non-extended view, only show first 5 orders
  const displayedOrders = extended ? orders : orders.slice(0, 5);
  
  const formatTimeAgo = (dateString) => {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  };

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
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  {extended && (
                    <TableCell className="hidden md:table-cell">
                      {formatTimeAgo(order.date)}
                    </TableCell>
                  )}
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
                  {extended && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
      
      {!extended && orders.length > 5 && (
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm">
            View All Orders
          </Button>
        </div>
      )}
    </div>
  );
}
