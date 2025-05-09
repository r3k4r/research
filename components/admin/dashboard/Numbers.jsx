"use client"

import { useState, useEffect } from "react"
import { Users, ShoppingBag, DollarSign, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import CountUp from "react-countup"
import { NumbersSkeleton } from "./SkeletonLoaders"

export default function DashboardNumbers() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFoodItems: 0,
    totalRevenue: 0,
    growthRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard/stats', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Dashboard stats:', data);
        
        if (data) {
          setStats({
            totalUsers: data.totalUsers || 0,
            totalFoodItems: data.totalFoodItems || 0,
            totalRevenue: data.totalRevenue || 0,
            growthRate: data.growthRate || 0
          });
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <NumbersSkeleton />
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
        <p>Error loading dashboard data: {error}</p>
        <p className="text-sm mt-2">Please try refreshing the page</p>
      </div>
    )
  }

  const dashboardItems = [
    { 
      icon: Users, 
      label: "Users", 
      value: stats.totalUsers,
      prefix: "",
      suffix: "",
      color: "text-blue-500" 
    },
    { 
      icon: ShoppingBag, 
      label: "Food Items", 
      value: stats.totalFoodItems,
      prefix: "",
      suffix: "",
      color: "text-emerald-500" 
    },
    { 
      icon: DollarSign, 
      label: "Revenue", 
      value: stats.totalRevenue,
      prefix: "$",
      suffix: "",
      color: "text-amber-500" 
    },
    { 
      icon: TrendingUp, 
      label: "Growth", 
      value: stats.growthRate,
      prefix: "",
      suffix: "%",
      decimals: 1,
      color: "text-violet-500" 
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
      {dashboardItems.map((item, index) => (
        <Card key={index} className="overflow-hidden border shadow-sm">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                <p className="text-lg font-semibold md:text-xl">
                  {item.prefix}
                  <CountUp
                    start={0}
                    end={item.value || 0}
                    duration={2}
                    separator=","
                    decimals={item.decimals || 0}
                    decimal="."
                    useEasing={true}
                  />
                  {item.suffix}
                </p>
              </div>
              <div className={`rounded-full p-1.5 bg-opacity-10 ${item.color.replace('text', 'bg')}`}>
                <item.icon className={`h-4 w-4 md:h-5 md:w-5 ${item.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
