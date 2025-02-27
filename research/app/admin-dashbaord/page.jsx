"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, ShoppingBag, DollarSign, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, Bar, Doughnut } from "react-chartjs-2"
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

  const [topRestaurants, setTopRestaurants] = useState([])
  const [genderDistribution, setGenderDistribution] = useState({ male: 0, female: 0 })

  useEffect(() => {
    // Fetch data from API
    // For now, we'll use mock data
    setStats({
      totalUsers: 1000,
      totalFoodItems: 500,
      totalRevenue: 50000,
      growthRate: 15,
    })

    setTopRestaurants([
      { name: "Pizza Palace", customers: 500, revenue: 15000 },
      { name: "Burger Bliss", customers: 450, revenue: 12000 },
      { name: "Sushi Supreme", customers: 400, revenue: 18000 },
      { name: "Taco Town", customers: 350, revenue: 9000 },
      { name: "Pasta Paradise", customers: 300, revenue: 11000 },
    ])

    setGenderDistribution({ male: 60, female: 40 })
  }, [])

  const salesData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Sales",
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        fill: false,
      },
    ],
  }

  const userGrowthData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "New Users",
        data: [50, 80, 120, 160, 200, 250],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  }

  const genderData = {
    labels: ["Male", "Female"],
    datasets: [
      {
        data: [genderDistribution.male, genderDistribution.female],
        backgroundColor: ["rgba(54, 162, 235, 0.5)", "rgba(255, 99, 132, 0.5)"],
      },
    ],
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { icon: Users, label: "Total Users", value: stats.totalUsers },
          { icon: ShoppingBag, label: "Food Items", value: stats.totalFoodItems },
          { icon: DollarSign, label: "Total Revenue", value: `$${stats.totalRevenue}` },
          { icon: TrendingUp, label: "Growth Rate", value: `${stats.growthRate}%` },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={salesData} options={{ responsive: true }} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={userGrowthData} options={{ responsive: true }} />
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut data={genderData} options={{ responsive: true }} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Restaurant Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Customers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topRestaurants.map((restaurant, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{restaurant.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{restaurant.customers}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${restaurant.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

