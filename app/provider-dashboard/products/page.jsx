"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FoodCard } from "@/components/Food-Card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle, Search } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("all") 
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteItemId, setDeleteItemId] = useState(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [expirationFilter, setExpirationFilter] = useState("active")
  const { showToast, ToastComponent } = useToast()
  
  // Pagination
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef()
  const lastProductElementRef = useRef(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    originalPrice: "",
    discountedPrice: "",
    quantity: "1",
    category: "",
    expiresIn: "",
    image: ""
  })

  // Fix the fetch products function to avoid creating dependency cycles
  const fetchProducts = useCallback(async (reset = false, searchQuery = searchTerm, categoryFilter = selectedCategory, statusFilter = expirationFilter) => {
    try {
      const currentPage = reset ? 1 : page
      if (reset) {
        setProducts([])
        setPage(1)
      }
      
      setLoading(true)
      
      const params = new URLSearchParams()
      params.append("page", currentPage)
      params.append("limit", 12)
      if (searchQuery) params.append("search", searchQuery)
      if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter)
      params.append("status", statusFilter)
      params.append("t", Date.now()) 
      
      const response = await fetch(`/api/provider/products?${params.toString()}`, { 
        cache: 'no-store'
      })
      
      if (!response.ok) throw new Error("Failed to fetch products")
      
      const data = await response.json()
      
      if (reset) {
        setProducts(data.products)
      } else {
        // Make sure we're not adding duplicate products by checking IDs
        setProducts(prev => {
          const existingIds = new Set(prev.map(product => product.id))
          const newProducts = data.products.filter(product => !existingIds.has(product.id))
          return [...prev, ...newProducts]
        })
      }
      
      setCategories(data.categories)
      setTotalItems(data.totalItems)
      setHasMore(data.hasMore)
      
      if (!reset) {
        setPage(prev => prev + 1)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      showToast("Failed to load products", "error")
    } finally {
      setLoading(false)
    }
  }, [page])  // Only depend on page to avoid dependency cycles

  // Fix: Split into separate effects - initial load
  useEffect(() => {
    fetchProducts(true)
  }, []) // Empty dependency array to only run on mount
  
  // Fix: Filter/search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '' || selectedCategory !== 'all' || expirationFilter !== 'all') {
        fetchProducts(true, searchTerm, selectedCategory, expirationFilter)
      }
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm, selectedCategory, expirationFilter]) // fetchProducts removed from deps
  
  // Fix: Observer implementation
  const lastProductRef = useCallback(node => {
    if (loading) return
    
    if (observer.current) {
      observer.current.disconnect()
      observer.current = null
    }
    
    if (node && hasMore) {
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          // Call with current state values
          fetchProducts(false)
        }
      })
      
      observer.current.observe(node)
    }
  }, [loading, hasMore]) // Remove fetchProducts to avoid infinite loop

  // Fix: Add cleanup function
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
        observer.current = null
      }
    }
  }, [])

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      originalPrice: "",
      discountedPrice: "",
      quantity: "1",
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

  const handleAddNew = () => {
    resetForm()
    setIsDialogOpen(true)
  }
  
  const handleEdit = async (id) => {
    try {
      const response = await fetch(`/api/provider/products/${id}`)
      const item = await response.json()
      
      setEditingItem(item)
      
      const now = new Date()
      const expiresAt = new Date(item.expiresAt)
      const hours = Math.max(1, Math.round((expiresAt - now) / (1000 * 60 * 60)))
      
      setFormData({
        name: item.name,
        description: item.description,
        originalPrice: item.price.toString(),
        discountedPrice: item.discountedPrice.toString(),
        quantity: item.quantity.toString(),
        category: item.category.name,
        expiresIn: hours.toString(),
        image: item.image || ""
      })
      
      setIsDialogOpen(true)
    } catch (error) {
      console.error("Error fetching item details:", error)
      showToast("Failed to load product details", "error")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const url = editingItem 
      ? `/api/provider/products/${editingItem.id}` 
      : "/api/provider/products"
    
    const method = editingItem ? "PUT" : "POST"
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData),
        cache: 'no-store'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save product")
      }
      
      showToast(
        editingItem 
          ? `"${formData.name}" has been updated successfully` 
          : `"${formData.name}" has been added successfully`, 
        "success"
      )
      
      await fetchProducts(true)
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving product:", error)
      showToast(`Error: ${error.message}`, "error")
    }
  }

  const confirmDelete = (id) => {
    setDeleteItemId(id)
    setIsDeleteAlertOpen(true)
  }

  const handleDeleteItem = async () => {
    try {
      const response = await fetch(`/api/provider/products/${deleteItemId}`, {
        method: "DELETE",
        cache: 'no-store'
      })
      
      if (!response.ok) throw new Error("Failed to delete product")
      
      showToast("Product deleted successfully", "success")
      
      await fetchProducts(true)
    } catch (error) {
      console.error("Error deleting product:", error)
      showToast(`Error: ${error.message}`, "error")
    } finally {
      setIsDeleteAlertOpen(false)
      setDeleteItemId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">My Products</h1>
        <div className="text-sm text-muted-foreground">
          Total products: <span className="font-medium">{totalItems}</span>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle>Product List</CardTitle>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              <div className="relative w-full sm:w-[220px] md:w-[180px] lg:w-[220px] mb-2 sm:mb-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-[180px] md:w-[140px] lg:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category?.id} value={category?.id}>
                      {category?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={expirationFilter} 
                onValueChange={setExpirationFilter}
              >
                <SelectTrigger className="w-full sm:w-[150px] md:w-[130px] lg:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Products</SelectItem>
                  <SelectItem value="expired">Expired Products</SelectItem>
                  <SelectItem value="all">All Products</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddNew} className="sm:whitespace-nowrap">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && products.length === 0 ? (
            <div className="flex justify-center p-8">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No products found. {searchTerm || selectedCategory !== "all" || expirationFilter !== "all" ? "Try changing your search or filters." : "Add your first product!"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((item, index) => {
                const isLastItem = index === products.length - 1;
                return (
                  <div 
                    key={item.id} 
                    className="relative"
                    ref={isLastItem ? lastProductRef : null}
                  >
                    <FoodCard 
                      id={item.id}
                      name={item.name}
                      description={item.description}
                      image={item.image || "/default-food.jpg"}
                      originalPrice={item.price}
                      discountedPrice={item.discountedPrice}
                      provider={item.provider.businessName}
                      providerId={item.providerId}
                      providerLogo={item.provider.logo || "/default-logo.png"}
                      category={item.category.name}
                      expiresIn={getExpiresInText(item.expiresAt)}
                    />
                    <div className="absolute top-2 right-2 space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(item.id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => confirmDelete(item.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {hasMore && products.length > 0 && loading && (
            <div className="flex justify-center p-4">
              <div className="text-muted-foreground text-sm">
                Loading more...
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteItemId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="name">Name</label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="description">Description</label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
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
                    value={formData.originalPrice}
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
                    value={formData.discountedPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="category">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(category => (
                      <SelectItem key={category?.id} value={category?.name}>
                        {category?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="expiresIn">Expires In (hours)</label>
                  <Input
                    id="expiresIn"
                    name="expiresIn"
                    type="number"
                    value={formData.expiresIn}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="quantity">Quantity</label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
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
                  value={formData.image}
                  onChange={handleInputChange}
                />
              </div>
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
                {editingItem ? "Update" : "Add"} Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {ToastComponent}
    </div>
  )
}

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