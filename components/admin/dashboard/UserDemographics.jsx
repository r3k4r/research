"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Doughnut } from "react-chartjs-2"
import { ChartSkeleton } from "./SkeletonLoaders"
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  Colors
} from "chart.js"

// Register ALL required Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  Colors
)

export default function UserDemographics() {
  const [genderData, setGenderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartHeight, setChartHeight] = useState(220)

  useEffect(() => {
    const updateHeight = () => {
      setChartHeight(window.innerWidth < 768 ? 180 : 220)
    }
    updateHeight()
    window.addEventListener("resize", updateHeight)
    
    // Fetch data with better error handling
    const fetchData = async () => {
      try {
        console.log("Fetching gender demographics data...")
        const response = await fetch('/api/admin/dashboard/userdemographics')
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`)
        }
        
        const data = await response.json()
        console.log("Received gender data:", data)
        setGenderData(data)
      } catch (err) {
        console.error("Error fetching gender data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    
    return () => window.removeEventListener("resize", updateHeight)
  }, [])

  // Show loading state
  if (loading) {
    return <ChartSkeleton title="Demographics" />
  }
  
  // Show error state
  if (error) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm md:text-base">User Demographics</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-red-500 text-sm">Failed to load demographic data</div>
        </CardContent>
      </Card>
    )
  }
  
  // Show empty state if no data
  if (!genderData || !genderData.datasets || !genderData.labels) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm md:text-base">User Demographics</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-sm text-slate-500">No demographic data available</div>
        </CardContent>
      </Card>
    )
  }

  // Show chart with data
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-sm md:text-base">User Demographics</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex justify-center">
        <div style={{ height: chartHeight, width: "100%", maxWidth: "220px" }}>
          <Doughnut 
            data={genderData}
            options={{ 
              responsive: true,
              maintainAspectRatio: false,
              cutout: '65%',
              plugins: {
                legend: { 
                  position: 'bottom', 
                  labels: { 
                    boxWidth: 12, 
                    padding: 15,
                    usePointStyle: true
                  } 
                }
              }
            }} 
          />
        </div>
      </CardContent>
    </Card>
  )
}
