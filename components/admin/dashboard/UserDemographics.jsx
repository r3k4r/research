"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Doughnut } from "react-chartjs-2"
import { fetchGenderData } from "@/utils/api"
import { ChartSkeleton } from "./SkeletonLoaders"

export default function UserDemographics() {
  const [genderData, setGenderData] = useState(null)
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
        const data = await fetchGenderData()
        setGenderData(data)
      } catch (error) {
        console.error("Failed to fetch gender data:", error)
      } finally {
        setLoading(false)
      }
    }

    getData()
    
    return () => window.removeEventListener("resize", updateHeight)
  }, [])

  if (loading) {
    return <ChartSkeleton title="Demographics" />
  }

  return (
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
  )
}
