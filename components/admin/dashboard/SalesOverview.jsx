"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line } from "react-chartjs-2"
import { fetchSalesData } from "@/utils/api"
import { ChartSkeleton } from "./SkeletonLoaders"

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
    
    const getData = async () => {
      try {
        const data = await fetchSalesData()
        setSalesData(data)
      } catch (error) {
        console.error("Failed to fetch sales data:", error)
      } finally {
        setLoading(false)
      }
    }

    getData()
    
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
                y: { beginAtZero: true },
                x: { grid: { display: false } }
              }
            }} 
          />
        </div>
      </CardContent>
    </Card>
  )
}
