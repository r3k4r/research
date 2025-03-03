'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Clock, 
  Leaf, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export function DashboardMetrics() {
  // In a real app, these would come from an API call
  const metrics = {
    totalRevenue: 1824.50,
    totalOrders: 42,
    pendingOrders: 8,
    activeCustomers: 65,
    wasteReduction: 86,
    averageOrder: 43.44,
    expiringItems: 12
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            +18% from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orders</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalOrders}</div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-muted-foreground">
              {metrics.pendingOrders} orders pending
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeCustomers}</div>
          <p className="text-xs text-muted-foreground">
            Active in the last 30 days
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Order</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.averageOrder.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            +2% from last week
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Waste Reduction</CardTitle>
          <Leaf className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.wasteReduction} kg</div>
          <p className="text-xs text-muted-foreground">
            Food saved this month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.expiringItems}</div>
          <p className="text-xs text-muted-foreground">
            Items expiring in 24 hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
