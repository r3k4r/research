"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar } from "react-chartjs-2"
import { ChartSkeleton } from "./SkeletonLoaders"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function UserGrowth() {
  const [userGrowthData, setUserGrowthData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartHeight, setChartHeight] = useState(220)

  useEffect(() => {
    const updateHeight = () => {
      const mobile = window.innerWidth < 768
      setChartHeight(mobile ? 180 : 220)
    }
    
    updateHeight()
    window.addEventListener("resize", updateHeight)
    
    const fetchUserGrowthData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/usergrowth')
        if (!response.ok) throw new Error('Failed to fetch user growth data')
        const data = await response.json()
        setUserGrowthData(data)
      } catch (error) {
        console.error("Failed to fetch user growth data:", error)
        // Provide fallback data if API fails
        setUserGrowthData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'New Users',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1
          }]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserGrowthData()
    
    return () => window.removeEventListener("resize", updateHeight)
  }, [])

  if (loading) {
    return <ChartSkeleton title="User Growth" />
  }

  return (
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
                y: { 
                  beginAtZero: true,
                  ticks: {
                    precision: 0 // Show only integers for user counts
                  }
                },
                x: { grid: { display: false } }
              }
            }} 
          />
        </div>
      </CardContent>
    </Card>
  )
}
