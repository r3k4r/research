"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    salesOverTime: { datasets: [] },
    userGrowth: { datasets: [] },
    categoryDistribution: { datasets: [] },
  })

  useEffect(() => {
    // Fetch analytics data from API
    // For now, we'll use mock data
    setAnalyticsData({
      salesOverTime: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Sales",
            data: [12000, 19000, 15000, 25000, 22000, 30000],
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      },
      userGrowth: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "New Users",
            data: [50, 80, 120, 160, 200, 250],
            backgroundColor: "rgba(54, 162, 235, 0.5)",
          },
        ],
      },
      categoryDistribution: {
        labels: ["Italian", "Mexican", "Chinese", "Indian", "American"],
        datasets: [
          {
            data: [30, 20, 25, 15, 10],
            backgroundColor: [
              "rgba(255, 99, 132, 0.5)",
              "rgba(54, 162, 235, 0.5)",
              "rgba(255, 206, 86, 0.5)",
              "rgba(75, 192, 192, 0.5)",
              "rgba(153, 102, 255, 0.5)",
            ],
          },
        ],
      },
    })
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={analyticsData.salesOverTime} options={{ responsive: true }} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={analyticsData.userGrowth} options={{ responsive: true }} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut data={analyticsData.categoryDistribution} options={{ responsive: true }} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

