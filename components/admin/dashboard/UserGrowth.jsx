"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar } from "react-chartjs-2"

export default function UserGrowth({ userGrowthData, chartHeight }) {
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
