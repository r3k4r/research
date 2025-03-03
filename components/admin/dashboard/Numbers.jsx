"use client"

import { useState, useEffect } from "react"
import { Users, ShoppingBag, DollarSign, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import CountUp from "react-countup"
import { fetchDashboardStats } from "@/utils/api"
import { NumbersSkeleton } from "./SkeletonLoaders"

export default function DashboardNumbers() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getStats = async () => {
      try {
        const data = await fetchDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    getStats()
  }, [])

  if (loading) {
    return <NumbersSkeleton />
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
                    end={item.value}
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
