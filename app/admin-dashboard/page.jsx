"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardNumbers from "@/components/admin/dashboard/Numbers"
import SalesOverview from "@/components/admin/dashboard/SalesOverview"
import UserGrowth from "@/components/admin/dashboard/UserGrowth"
import UserDemographics from "@/components/admin/dashboard/UserDemographics"
import TopRestaurants from "@/components/admin/dashboard/TopRestaurants"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFoodItems: 0,
    totalRevenue: 0,
    growthRate: 0,
  })
  const [animationsStarted, setAnimationsStarted] = useState(false)
  const [topRestaurants, setTopRestaurants] = useState([])
  const [chartHeight, setChartHeight] = useState(220)
  
  // Prepare chart data
  const salesData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Sales",
        data: [12800, 19400, 15200, 25600, 22300, 30100],
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  }

  const userGrowthData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "New Users",
        data: [56, 85, 124, 168, 214, 264],
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        hoverBackgroundColor: "rgba(16, 185, 129, 0.9)",
        borderRadius: 4,
      },
    ],
  }

  const genderData = {
    labels: ["Male", "Female", "Other"],
    datasets: [
      {
        data: [58, 37, 5],
        backgroundColor: [
          "rgba(37, 99, 235, 0.7)", 
          "rgba(236, 72, 153, 0.7)",
          "rgba(107, 114, 128, 0.7)"
        ],
        borderWidth: 0,
      },
    ],
  }

  useEffect(() => {
    const updateHeight = () => {
      const mobile = window.innerWidth < 768
      setChartHeight(mobile ? 180 : 220)
    }
    
    updateHeight()
    window.addEventListener("resize", updateHeight)
    
    // Mock data
    setTimeout(() => {
      setStats({
        totalUsers: 1248,
        totalFoodItems: 583,
        totalRevenue: 52750,
        growthRate: 15.8,
      })
      setAnimationsStarted(true)
      
      setTopRestaurants([
        { name: "Pizza Palace", customers: 578, revenue: 15840 },
        { name: "Burger Bliss", customers: 452, revenue: 12340 },
        { name: "Sushi Supreme", customers: 412, revenue: 18650 },
        { name: "Taco Town", customers: 368, revenue: 9240 },
        { name: "Pasta Paradise", customers: 316, revenue: 11280 },
      ])
    }, 300) 
    
    return () => window.removeEventListener("resize", updateHeight)
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold md:text-2xl">Dashboard Overview</h1>

      {/* Numbers component */}
      <DashboardNumbers stats={stats} animationsStarted={animationsStarted} />

      <div className="grid gap-3 md:grid-cols-2">
        {/* Sales Overview component */}
        <SalesOverview salesData={salesData} chartHeight={chartHeight} />

        {/* User Growth component */}
        <UserGrowth userGrowthData={userGrowthData} chartHeight={chartHeight} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* User Demographics component */}
        <UserDemographics genderData={genderData} chartHeight={chartHeight} />

        {/* Top Restaurants component */}
        <TopRestaurants topRestaurants={topRestaurants} />
      </div>
    </div>
  )
}

