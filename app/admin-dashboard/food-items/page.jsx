"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FoodCard } from "@/components/Food-Card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

export default function FoodItemsPage() {
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("all") 
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    originalPrice: "",
    discountedPrice: "",
    quantity: "1",
    provider: "",
    providerId: "",
    category: "",
    expiresIn: "",
    image: ""
  })

  // Fetch food items with filters
  const fetchFoodItems = async () => {
    setLoading(true)
    
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory) 
      
      const response = await fetch(`/api/admin/food?${params.toString()}`)
      const data = await response.json()
      
      setFoodItems(data?.foodItems)
      setCategories(data?.categories)
      setTotalItems(data?.totalItems)
    } catch (error) {
      console.error("Error fetching food items:", error)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchFoodItems()
  }, [])
  
  // Fetch when search or filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFoodItems()
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm, selectedCategory])

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      originalPrice: "",
      discountedPrice: "",
      quantity: "1",
      provider: "",
      providerId: "",
      category: "",
      expiresIn: "",
      image: ""
    })
    setEditingItem(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }
  
  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleAddNew = () => {
    resetForm()
    setIsDialogOpen(true)
  }
  
  const handleEdit = async (id) => {
    try {
      const response = await fetch(`/api/admin/food/${id}`)
      const item = await response.json()
      
      setEditingItem(item)
      
      // Calculate expires in hours
      const now = new Date()
      const expiresAt = new Date(item.expiresAt)
      const hours = Math.max(1, Math.round((expiresAt - now) / (1000 * 60 * 60)))
      
      setFormData({
        name: item.name,
        description: item.description,
        originalPrice: item.price.toString(),
        discountedPrice: item.discountedPrice.toString(),
        quantity: item.quantity.toString(),
        provider: item.provider.businessName,
        providerId: item.providerId,
        category: item.category.name,
        expiresIn: hours.toString(),
        image: item.image || ""
      })
      
      setIsDialogOpen(true)
    } catch (error) {
      console.error("Error fetching item details:", error)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const url = editingItem 
      ? `/api/admin/food/${editingItem.id}` 
      : "/api/admin/food"
    
    const method = editingItem ? "PUT" : "POST"
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) throw new Error("Failed to save food item")
      
      fetchFoodItems()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving food item:", error)
    }
  }

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return
    
    try {
      const response = await fetch(`/api/admin/food/${id}`, {
        method: "DELETE"
      })
      
      if (!response.ok) throw new Error("Failed to delete item")
      
      fetchFoodItems()
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Food Items Management</h1>
        <div className="text-sm text-muted-foreground">
          Total items: <span className="font-medium">{totalItems}</span>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle>Food Items List</CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Input
                placeholder="Search by name or provider..."
                className="w-full sm:w-[220px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem> {/* Changed from "" to "all" */}
                  {categories.map(category => (
                    <SelectItem key={category?.id} value={category?.id}>
                      {category?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddNew}>Add New Food Item</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">Loading...</div>
          ) : foodItems?.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No items found. {searchTerm || selectedCategory ? "Try changing your search or filter." : "Add your first item!"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems?.map((item) => (
                <div key={item.id} className="relative">
                  <FoodCard 
                    id={item?.id}
                    name={item?.name}
                    description={item?.description}
                    image={item?.image || "/default-food.jpg"}
                    originalPrice={item?.price}
                    discountedPrice={item?.discountedPrice}
                    provider={item?.provider.businessName}
                    providerId={item?.providerId}
                    providerLogo={item?.provider.logo || "/default-logo.png"}
                    category={item?.category.name}
                    expiresIn={getExpiresInText(item?.expiresAt)}
                  />
                  <div className="absolute top-2 right-2 space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(item?.id)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteItem(item?.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Food Item" : "Add New Food Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="name">Name</label>
                <Input
                  id="name"
                  name="name"
                  value={formData?.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="description">Description</label>
                <Input
                  id="description"
                  name="description"
                  value={formData?.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="originalPrice">Original Price</label>
                  <Input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData?.originalPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="discountedPrice">Discounted Price</label>
                  <Input
                    id="discountedPrice"
                    name="discountedPrice"
                    type="number"
                    step="0.01"
                    value={formData?.discountedPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="category">Category</label>
                  <Input
                    id="category"
                    name="category"
                    value={formData?.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="expiresIn">Expires In (hours)</label>
                  <Input
                    id="expiresIn"
                    name="expiresIn"
                    type="number"
                    value={formData?.expiresIn}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="image">Image URL</label>
                <Input
                  id="image"
                  name="image"
                  value={formData?.image}
                  onChange={handleInputChange}
                />
              </div>
              {!editingItem && (
                <div className="grid gap-2">
                  <label htmlFor="providerId">Provider ID</label>
                  <Input
                    id="providerId"
                    name="providerId"
                    value={formData?.providerId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? "Update" : "Add"} Food Item
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function to format expires in text
function getExpiresInText(expiresAt) {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diffMs = expires - now
  
  if (diffMs < 0) return "Expired"
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 24) {
    return `${Math.floor(diffHours / 24)}d ${diffHours % 24}h`
  }
  
  if (diffHours === 0) {
    return `${diffMinutes}m`
  }
  
  return `${diffHours}h ${diffMinutes}m`
}

