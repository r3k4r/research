"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar } from "react-chartjs-2"
import { fetchUserGrowthData } from "@/utils/api"
import { ChartSkeleton } from "./SkeletonLoaders"

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
    
    const getData = async () => {
      try {
        const data = await fetchUserGrowthData()
        setUserGrowthData(data)
      } catch (error) {
        console.error("Failed to fetch user growth data:", error)
      } finally {
        setLoading(false)
      }
    }

    getData()
    
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
