'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecentOrdersTable } from '@/components/provider/RecentOrdersTable';
import { DashboardMetrics } from '@/components/provider/DashboardMetrics';
import { ExpiringItems } from '@/components/provider/ExpiringItems';
import { Overview } from '@/components/provider/Overview';




export default function ProviderDashboard() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <DashboardMetrics />
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Items</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Weekly Sales</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  You sold 15 products today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrdersTable />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Manage and track your recent orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentOrdersTable extended={true} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Items</CardTitle>
              <CardDescription>
                Items that will expire soon and require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpiringItems />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}