"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardNumbers from "@/components/admin/dashboard/Numbers"
import SalesOverview from "@/components/admin/dashboard/SalesOverview"
import UserGrowth from "@/components/admin/dashboard/UserGrowth"
import UserDemographics from "@/components/admin/dashboard/UserDemographics"

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
import TopRestaurantsSection from "@/components/admin/dashboard/TopRestaurants"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export default function AdminDashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold md:text-2xl">Dashboard Overview</h1>

      {/* Numbers component */}
      <DashboardNumbers />

      <div className="grid gap-3 md:grid-cols-2">
        {/* Sales Overview component */}
        <SalesOverview />

        {/* User Growth component */}
        <UserGrowth />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* User Demographics component */}
        <UserDemographics />

        {/* Top Restaurants component */}
        <TopRestaurantsSection />
      </div>
    </div>
  )
}

