'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Clock, 
  TrendingUp
} from 'lucide-react';
import CountUp from 'react-countup';

// Format number to have exactly 4 decimal places
const formatCurrency = (value) => {
  return Number(value).toFixed(4);
};

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    activeCustomers: 0,
    averageOrder: 0,
    revenueChangePercentage: 0,
    averageOrderChangePercentage: 0,
    currency: 'IQD',
    isLoading: true,
    error: null
  });

  useEffect(() => {
    async function fetchDashboardMetrics() {
      try {
        const response = await fetch('/api/provider/dashboardmetrics');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard metrics');
        }
        const data = await response.json();
        setMetrics({
          ...data,
          isLoading: false,
          error: null
        });
      } catch (error) {
        setMetrics(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
        console.error('Error fetching dashboard metrics:', error);
      }
    }

    fetchDashboardMetrics();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.isLoading ? '...' : (
              <>
                <CountUp 
                  end={Number(metrics.totalRevenue)}
                  decimals={4}
                  duration={2.5}
                />
                {' '}{metrics.currency}
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.revenueChangePercentage > 0 ? '+' : ''}{metrics.revenueChangePercentage}% from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orders</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.isLoading ? '...' : (
              <CountUp 
                end={metrics.totalOrders}
                duration={2}
              />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-muted-foreground">
              {metrics.isLoading ? '...' : (
                <CountUp 
                  end={metrics.pendingOrders}
                  duration={1.5}
                />
              )} orders pending
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
          <div className="text-2xl font-bold">
            {metrics.isLoading ? '...' : (
              <CountUp 
                end={metrics.activeCustomers}
                duration={2}
              />
            )}
          </div>
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
          <div className="text-2xl font-bold">
            {metrics.isLoading ? '...' : (
              <>
                <CountUp 
                  end={Number(metrics.averageOrder)}
                  decimals={4}
                  duration={2.5}
                />
                {' '}{metrics.currency}
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.averageOrderChangePercentage > 0 ? '+' : ''}{metrics.averageOrderChangePercentage}% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
