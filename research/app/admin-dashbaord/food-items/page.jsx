"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FoodCard } from "@/components/Food-Card"

export default function FoodItemsPage() {
  const [foodItems, setFoodItems] = useState([])
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    originalPrice: 0,
    discountedPrice: 0,
    provider: "",
    category: "",
    expiresIn: "",
  })

  useEffect(() => {
    // Fetch food items from API
    // For now, we'll use mock data
    setFoodItems([
      {
        id: 1,
        name: "Margherita Pizza",
        description: "Classic cheese and tomato pizza",
        image: "/pizza.jpg",
        originalPrice: 12.99,
        discountedPrice: 9.99,
        provider: "Pizza Palace",
        providerLogo: "/pizza-palace-logo.jpg",
        category: "Italian",
        expiresIn: "2 hours",
      },
      // Add more mock food items...
    ])
  }, [])

  const handleAddItem = () => {
    // In a real application, you would make an API call here
    setFoodItems([...foodItems, { id: Date.now(), ...newItem }])
    setNewItem({
      name: "",
      description: "",
      originalPrice: 0,
      discountedPrice: 0,
      provider: "",
      category: "",
      expiresIn: "",
    })
  }

  const handleDeleteItem = (id) => {
    // In a real application, you would make an API call here
    setFoodItems(foodItems.filter((item) => item.id !== id))
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Food Items Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Food Items List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <Input
              placeholder="Search food items..."
              className="max-w-sm"
              // Implement search functionality
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add New Food Item</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Food Item</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    placeholder="Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Original Price"
                    value={newItem.originalPrice}
                    onChange={(e) => setNewItem({ ...newItem, originalPrice: Number.parseFloat(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Discounted Price"
                    value={newItem.discountedPrice}
                    onChange={(e) => setNewItem({ ...newItem, discountedPrice: Number.parseFloat(e.target.value) })}
                  />
                  <Input
                    placeholder="Provider"
                    value={newItem.provider}
                    onChange={(e) => setNewItem({ ...newItem, provider: e.target.value })}
                  />
                  <Input
                    placeholder="Category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  />
                  <Input
                    placeholder="Expires In"
                    value={newItem.expiresIn}
                    onChange={(e) => setNewItem({ ...newItem, expiresIn: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddItem}>Add Food Item</Button>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodItems.map((item) => (
              <div key={item.id} className="relative">
                <FoodCard {...item} />
                <div className="absolute top-2 right-2 space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

