"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableSkeleton } from "./SkeletonLoaders"

export default function TopRestaurantsSection() {
  const [topRestaurants, setTopRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTopRestaurants = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/toprestaurants')
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`)
        }
        
        const data = await response.json()
        setTopRestaurants(data)
      } catch (error) {
        console.error("Failed to fetch top restaurants:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTopRestaurants()
  }, [])

  if (loading) {
    return <TableSkeleton title="Top Restaurants" />
  }
  
  if (error) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm md:text-base">Top Restaurants</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="text-red-500 text-sm">Failed to load restaurant data</div>
        </CardContent>
      </Card>
    )
  }
  
  if (!topRestaurants.length) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm md:text-base">Top Restaurants</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="text-sm text-slate-500">No restaurant data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
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
              {topRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="border-t">
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
  )
}
