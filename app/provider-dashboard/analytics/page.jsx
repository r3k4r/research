'use client';

import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Printer,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: 'Provider Analytics Report',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/provider/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const data = await response.json();
        setAnalyticsData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-destructive mr-2" />
              <div>
                <h3 className="font-medium">Error loading analytics data</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
                <p className="text-sm text-muted-foreground mt-1">Please try again later or contact support.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sales & Waste Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Period: {analyticsData?.timePeriod}
          </p>
        </div>
        <Button 
          onClick={handlePrint}
          className="flex items-center"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </Button>
      </div>
      
      <div ref={reportRef} className="print-container space-y-8">
        {/* Waste reduction highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Waste Reduction Impact</CardTitle>
            <CardDescription>Your environmental and financial impact from reducing food waste</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Items Saved</p>
                  <p className="text-2xl font-bold">{analyticsData?.wasteReduction.totalItemsSaved}</p>
                  <p className="text-xs text-muted-foreground">vs last month: {analyticsData?.wasteReduction.previousMonth.improvement}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Food Waste Prevented</p>
                  <p className="text-2xl font-bold">{analyticsData?.wasteReduction.totalWeightSaved}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">CO₂ Emissions Prevented</p>
                  <p className="text-2xl font-bold">{analyticsData?.wasteReduction.co2Prevented}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Revenue Recovered</p>
                  <p className="text-2xl font-bold">{analyticsData?.wasteReduction.moneyRecovered}</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Most sold items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
            <CardDescription>Your best performing products</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Units Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsData?.mostSoldItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>{item.revenue.toFixed(2)} IQD</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Unsold items */}
        <Card>
          <CardHeader>
            <CardTitle>Items with Low Sales</CardTitle>
            <CardDescription>These items might need promotion or menu adjustment to reduce waste</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unsold Units</TableHead>
                  <TableHead>Potential Loss</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsData?.unsoldItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>{item.potential_loss.toFixed(2)} IQD</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Category performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Sales performance by food category</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Items Sold</TableHead>
                  <TableHead>Items Unsold</TableHead>
                  <TableHead>Sale Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsData?.categoryPerformance.map((category, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{category.category}</TableCell>
                    <TableCell>{category.sold}</TableCell>
                    <TableCell>{category.unsold}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={category.salePercentage} className="w-full max-w-[180px]" />
                        <span>{category.salePercentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="border-muted">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Suggestions to optimize your menu and reduce waste</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Consider reducing production of <strong className="text-foreground">Seafood Platter</strong> which has the highest unsold rate.</li>
              <li>Your <strong className="text-foreground">Salads</strong> category has excellent performance with 90% sale rate.</li>
              <li>Try bundling <strong className="text-foreground">Kale Chips</strong> with popular items to reduce waste.</li>
              <li>Consider offering end-of-day promotions for <strong className="text-foreground">Desserts</strong> categories with higher unsold rates.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default Analytics;