"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Doughnut } from "react-chartjs-2"

export default function UserDemographics({ genderData, chartHeight }) {
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
