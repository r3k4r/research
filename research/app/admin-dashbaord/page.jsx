"use client"

import { useState, useEffect } from "react"
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
  const [chartHeight, setChartHeight] = useState(220)

  useEffect(() => {
    const updateHeight = () => {
      const mobile = window.innerWidth < 768
      setChartHeight(mobile ? 180 : 220)
    }
    
    updateHeight()
    window.addEventListener("resize", updateHeight)
    
    // Mock data
    setStats({
      totalUsers: 1248,
      totalFoodItems: 583,
      totalRevenue: 52750,
      growthRate: 15.8,
    })

    setTopRestaurants([
      { name: "Pizza Palace", customers: 578, revenue: 15840 },
      { name: "Burger Bliss", customers: 452, revenue: 12340 },
      { name: "Sushi Supreme", customers: 412, revenue: 18650 },
      { name: "Taco Town", customers: 368, revenue: 9240 },
      { name: "Pasta Paradise", customers: 316, revenue: 11280 },
    ])
    
    return () => window.removeEventListener("resize", updateHeight)
  }, [])

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

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold md:text-2xl">Dashboard Overview</h1>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        {[
          { icon: Users, label: "Users", value: stats.totalUsers.toLocaleString(), color: "text-blue-500" },
          { icon: ShoppingBag, label: "Food Items", value: stats.totalFoodItems.toLocaleString(), color: "text-emerald-500" },
          { icon: DollarSign, label: "Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, color: "text-amber-500" },
          { icon: TrendingUp, label: "Growth", value: `${stats.growthRate.toFixed(1)}%`, color: "text-violet-500" },
        ].map((item, index) => (
          <Card key={index} className="overflow-hidden border shadow-sm">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                  <p className="text-lg font-semibold md:text-xl">{item.value}</p>
                </div>
                <div className={`rounded-full p-1.5 bg-opacity-10 ${item.color.replace('text', 'bg')}`}>
                  <item.icon className={`h-4 w-4 md:h-5 md:w-5 ${item.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm md:text-base">Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div style={{ height: chartHeight }}>
              <Line 
                data={salesData} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: { beginAtZero: true },
                    x: { grid: { display: false } }
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm md:text-base">User Growth</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div style={{ height: chartHeight }}>
              <Bar 
                data={userGrowthData} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: { beginAtZero: true },
                    x: { grid: { display: false } }
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm md:text-base">User Demographics</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex justify-center">
            <div style={{ height: chartHeight, maxWidth: "220px" }}>
              <Doughnut 
                data={genderData} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '65%',
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } }
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm md:text-base">Top Restaurants</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/40 text-xs">
                  <tr>
                    <th className="text-left p-2 pl-3">Restaurant</th>
                    <th className="text-right p-2">Customers</th>
                    <th className="text-right p-2 pr-3">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topRestaurants.map((restaurant, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2 pl-3 text-sm">{restaurant.name}</td>
                      <td className="p-2 text-right text-sm">{restaurant.customers}</td>
                      <td className="p-2 pr-3 text-right text-sm font-medium">${restaurant.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

