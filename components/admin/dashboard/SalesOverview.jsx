"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line } from "react-chartjs-2"
import { ChartSkeleton } from "./SkeletonLoaders"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

export default function SalesOverview() {
  const [salesData, setSalesData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartHeight, setChartHeight] = useState(220)

  useEffect(() => {
    const updateHeight = () => {
      const mobile = window.innerWidth < 768
      setChartHeight(mobile ? 180 : 220)
    }
    
    updateHeight()
    window.addEventListener("resize", updateHeight)
    
    const fetchSalesData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/salesoverview')
        if (!response.ok) throw new Error('Failed to fetch sales data')
        const data = await response.json()
      
        setSalesData(data)
      } catch (error) {
        console.error("Failed to fetch sales data:", error)
        // Provide fallback data if API fails
        setSalesData({
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Sales',
            data: [0, 0, 0, 0, 0, 0, 0],
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            tension: 0.3
          }]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSalesData()
    
    return () => window.removeEventListener("resize", updateHeight)
  }, [])

  if (loading) {
    return <ChartSkeleton title="Sales Overview" />
  }

  return (
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
                y: { 
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `$${value}`
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
