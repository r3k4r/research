"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "Second Serve",
    contactEmail: "contact@secondserve.com",
    allowNewRegistrations: true,
    maintenanceMode: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real application, you would make an API call here to save the settings
    console.log("Settings saved:", settings)
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" name="siteName" value={settings.siteName} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="allowNewRegistrations"
                name="allowNewRegistrations"
                checked={settings.allowNewRegistrations}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, allowNewRegistrations: checked }))}
              />
              <Label htmlFor="allowNewRegistrations">Allow New Registrations</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenanceMode"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, maintenanceMode: checked }))}
              />
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            </div>
            <Button type="submit">Save Settings</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

