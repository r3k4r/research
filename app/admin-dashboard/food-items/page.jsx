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
  SelectGroup,
  SelectLabel
} from "@/components/ui/select"
import { Plus, Check, X, Search } from "lucide-react"
import Image from "next/image"
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

export default function FoodItemsPage() {
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("all") 
  const [searchTerm, setSearchTerm] = useState("")
  const [expirationFilter, setExpirationFilter] = useState("active")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [providers, setProviders] = useState([])
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [providerSearchOpen, setProviderSearchOpen] = useState(false)
  const [providerSearchTerm, setProviderSearchTerm] = useState("")
  const [deleteItemId, setDeleteItemId] = useState(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const { showToast, ToastComponent } = useToast()
  
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

  // Pagination
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef()

  const fetchFoodItems = useCallback(async (reset = false, searchQuery = searchTerm, categoryFilter = selectedCategory, statusFilter = expirationFilter) => {
    try {
      const currentPage = reset ? 1 : page
      if (reset) {
        setFoodItems([])
        setPage(1)
      }
      
      setLoading(true)
      
      const params = new URLSearchParams()
      params.append("page", currentPage)
      params.append("limit", 12)
      if (searchQuery) params.append("search", searchQuery)
      if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter) 
      params.append("status", statusFilter)
      params.append("t", Date.now()) // Cache busting
      
      const response = await fetch(`/api/admin/food?${params.toString()}`, { 
        cache: 'no-store'
      })
      
      if (!response.ok) throw new Error("Failed to fetch food items")
      
      const data = await response.json()
      
      if (reset) {
        setFoodItems(data.foodItems)
      } else {
        // Make sure we're not adding duplicate items by checking IDs
        setFoodItems(prev => {
          const existingIds = new Set(prev.map(item => item.id))
          const newItems = data.foodItems.filter(item => !existingIds.has(item.id))
          return [...prev, ...newItems]
        })
      }
      
      setCategories(data.categories)
      setTotalItems(data.totalItems)
      setHasMore(data.hasMore || false)
      
      if (!reset && data.foodItems.length > 0) {
        setPage(prev => prev + 1)
      }
    } catch (error) {
      console.error("Error fetching food items:", error)
      showToast("Failed to load food items", "error")
    } finally {
      setLoading(false)
    }
  }, [page])

  const fetchProviders = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users?role=PROVIDER&limit=100&t=' + Date.now(), { cache: 'no-store' })
      if (!response.ok) throw new Error("Failed to fetch providers")
      
      const data = await response.json()
      
      const providersList = data.users
        .filter(user => user.providerProfile)
        .map(user => ({
          id: user.providerProfile.id,
          businessName: user.providerProfile.businessName,
          logo: user.providerProfile.logo
        }))
      
      setProviders(providersList)
    } catch (error) {
      console.error("Error fetching providers:", error)
    }
  }, [])

  useEffect(() => {
    // Only fetch on initial mount, with empty array dependencies
    fetchFoodItems(true)
    fetchProviders()
  }, []) // Empty dependency array is key here

  useEffect(() => {
    const timer = setTimeout(() => {
      // Always fetch when any filter changes, including when expirationFilter is "all"
      fetchFoodItems(true, searchTerm, selectedCategory, expirationFilter)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm, selectedCategory, expirationFilter])

  const lastItemRef = useCallback(node => {
    if (loading) return
    
    // Always clean up old observer first
    if (observer.current) {
      observer.current.disconnect()
      observer.current = null
    }
    
    // Only attach new observer if there's more data
    if (node && hasMore) {
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          // Manually call with current state to avoid dependency issue
          fetchFoodItems(false)
        }
      })
      
      observer.current.observe(node)
    }
  }, [loading, hasMore]) // fetchFoodItems excluded to prevent infinite loop

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
      provider: "",
      providerId: "",
      category: "",
      expiresIn: "",
      image: ""
    })
    setEditingItem(null)
    setShowNewCategoryInput(false)
    setNewCategoryName("")
    setProviderSearchTerm("")
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
  
  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    const categoryName = newCategoryName.trim();
    
    try {
      const existingCategory = categories.find(
        c => c.name.toLowerCase() === categoryName.toLowerCase()
      );
      
      if (existingCategory) {
        setFormData({ ...formData, category: existingCategory.name });
        showToast(`Using existing category "${existingCategory.name}"`, "success");
      } else {
        setFormData({ ...formData, category: categoryName });
        
        const testData = {
          name: `__TEST_${Date.now()}`,
          description: "Test item for category creation - will be deleted",
          originalPrice: "0.01",
          discountedPrice: "0.01",
          quantity: "1",
          category: categoryName,
          providerId: providers[0]?.id || "",
          expiresIn: "1",
          image: ""
        };
        
        const response = await fetch('/api/admin/food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData)
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.id) {
            await fetch(`/api/admin/food/${result.id}`, { method: 'DELETE' });
          }
          
          await fetchFoodItems(true);
          showToast(`New category "${categoryName}" created`, "success");
        } else {
          const error = await response.json();
          throw new Error(error.error || "Failed to create category");
        }
      }
    } catch (error) {
      console.error("Error creating category:", error);
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setShowNewCategoryInput(false);
      setNewCategoryName("");
    }
  };

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
        body: JSON.stringify(formData),
        cache: 'no-store'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save food item")
      }
      
      const result = await response.json()
      
      showToast(
        editingItem 
          ? `"${formData.name}" has been updated successfully` 
          : `"${formData.name}" has been added successfully`, 
        "success"
      )
      
      await fetchFoodItems(true)
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving food item:", error)
      showToast(`Error: ${error.message}`, "error")
    }
  }

  const confirmDelete = (id) => {
    setDeleteItemId(id)
    setIsDeleteAlertOpen(true)
  }

  const handleDeleteItem = async () => {
    try {
      const response = await fetch(`/api/admin/food/${deleteItemId}`, {
        method: "DELETE",
        cache: 'no-store'
      })
      
      if (!response.ok) throw new Error("Failed to delete item")
      
      showToast("Food item deleted successfully", "success")
      
      await fetchFoodItems(true)
    } catch (error) {
      console.error("Error deleting item:", error)
      showToast(`Error: ${error.message}`, "error")
    } finally {
      setIsDeleteAlertOpen(false)
      setDeleteItemId(null)
    }
  }

  const filteredProviders = providers.filter(provider =>
    provider.businessName.toLowerCase().includes(providerSearchTerm.toLowerCase())
  )
  
  const handleSelectProvider = (provider) => {
    setFormData({
      ...formData,
      providerId: provider.id,
      provider: provider.businessName
    })
    setProviderSearchOpen(false)
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
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
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
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Items</SelectItem>
                  <SelectItem value="expired">Expired Items</SelectItem>
                  <SelectItem value="all">All Items</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddNew}>Add New Food Item</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && foodItems.length === 0 ? (
            <div className="flex justify-center p-8">Loading...</div>
          ) : foodItems?.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No items found. {searchTerm || selectedCategory !== "all" || expirationFilter !== "all" ? "Try changing your search or filters." : "Add your first item!"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems?.map((item, index) => {
                const isLastItem = index === foodItems.length - 1;
                return (
                  <div 
                    key={item.id} 
                    className="relative"
                    ref={isLastItem ? lastItemRef : null}
                  >
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
                        onClick={() => confirmDelete(item?.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {hasMore && foodItems.length > 0 && loading && (
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
              This action cannot be undone. This will permanently delete the food item
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
              
              <div className="grid gap-2">
                <label htmlFor="category">Category</label>
                {showNewCategoryInput ? (
                  <div className="flex gap-2">
                    <Input
                      id="newCategory"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="New category name"
                      autoFocus
                    />
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setShowNewCategoryInput(false)}
                    >
                      <X size={16} />
                    </Button>
                    <Button 
                      type="button" 
                      size="icon" 
                      onClick={handleAddNewCategory}
                    >
                      <Check size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categories</SelectLabel>
                          {categories?.map(category => (
                            <SelectItem key={category?.id} value={category?.name}>
                              {category?.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="outline"
                      onClick={() => setShowNewCategoryInput(true)}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                )}
              </div>
              
              {!editingItem && (
                <div className="grid gap-2">
                  <label htmlFor="provider">Provider</label>
                  <div className="relative">
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setProviderSearchOpen(!providerSearchOpen)}
                    >
                      {formData.providerId ? (
                        <div className="flex items-center gap-2">
                          <div className="relative w-6 h-6 rounded-full overflow-hidden">
                            {providers.find(p => p.id === formData.providerId)?.logo ? (
                              <Image 
                                src={providers.find(p => p.id === formData.providerId)?.logo}
                                alt={formData.provider}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-medium">{formData.provider?.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <span className="truncate">{formData.provider}</span>
                        </div>
                      ) : (
                        <span>Select provider</span>
                      )}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                    
                    {providerSearchOpen && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover rounded-md border shadow-md">
                        <div className="p-2 border-b sticky top-0 bg-popover z-10">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search providers..."
                              value={providerSearchTerm}
                              onChange={(e) => setProviderSearchTerm(e.target.value)}
                              className="pl-8"
                              autoFocus
                            />
                          </div>
                        </div>
                        
                        <div className="max-h-[250px] overflow-y-auto p-1">
                          {filteredProviders.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              No providers found
                            </div>
                          ) : (
                            filteredProviders.map(provider => (
                              <div
                                key={provider.id}
                                onClick={() => {
                                  handleSelectProvider(provider);
                                  setProviderSearchTerm("");
                                  setProviderSearchOpen(false);
                                }}
                                className={`
                                  flex items-center gap-3 p-2.5 rounded-sm cursor-pointer
                                  ${formData.providerId === provider.id ? 'bg-primary/5 text-primary' : 'hover:bg-accent'}
                                `}
                              >
                                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                  {provider.logo ? (
                                    <Image
                                      src={provider.logo}
                                      alt={provider.businessName}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-base font-medium">
                                        {provider.businessName.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{provider.businessName}</p>
                                </div>
                                
                                {formData.providerId === provider.id && (
                                  <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                        
                        <div className="p-2 border-t sticky bottom-0 bg-popover flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setProviderSearchOpen(false);
                              setProviderSearchTerm("");
                            }}
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
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
                <div className="grid gap-2">
                  <label htmlFor="quantity">Quantity</label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData?.quantity}
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

