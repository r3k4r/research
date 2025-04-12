"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/toast"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { 
  RefreshCw, 
  Search, 
  MoreVertical, 
  PenSquare, 
  Trash2, 
  Plus, 
  Star,
  Settings
} from "lucide-react"

export default function ControlPanelPage() {
  const { showToast, ToastComponent } = useToast()
  const [activeTab, setActiveTab] = useState("providers")
  const [loading, setLoading] = useState(false)
  
  // Providers state
  const [providers, setProviders] = useState([])
  const [searchProviderTerm, setSearchProviderTerm] = useState("")
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [isEditingProvider, setIsEditingProvider] = useState(false)
  const [isDeleteProviderDialogOpen, setIsDeleteProviderDialogOpen] = useState(false)
  
  // Categories state
  const [categories, setCategories] = useState([])
  const [searchCategoryTerm, setSearchCategoryTerm] = useState("")
  const [categoryFormData, setCategoryFormData] = useState({ name: "" })
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  // Reviews state
  const [reviews, setReviews] = useState([])
  const [searchReviewTerm, setSearchReviewTerm] = useState("")
  const [isDeleteReviewDialogOpen, setIsDeleteReviewDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  
  // Settings state
  const [settings, setSettings] = useState({
    general: {
      siteName: "Second Serve",
      siteDescription: "Reduce food waste and save money",
      contactEmail: "contact@secondserve.com",
      maintenanceMode: false,
      allowRegistrations: true,
    },
    notification: {
      enableEmailNotifications: true,
      enablePushNotifications: false,
      newOrderNotification: true,
      lowInventoryAlert: true,
      dailySummaryEmail: true,
    },
    integration: {
      googleMapsApiKey: "",
      stripePublicKey: "",
      stripeSecretKey: "",
    }
  })

  // Fetch providers, categories, and reviews when tab changes
  useEffect(() => {
    if (activeTab === "providers") fetchProviders()
    if (activeTab === "categories") fetchCategories()
    if (activeTab === "reviews") fetchReviews()
    if (activeTab === "settings") fetchSettings()
  }, [activeTab])
  
  // Providers methods
  const fetchProviders = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users?role=PROVIDER&limit=100')
      if (!response.ok) throw new Error("Failed to fetch providers")
      const data = await response.json()
      
      // Map to the format we need
      const formattedProviders = data.users
        .filter(user => user.providerProfile)
        .map(user => ({
          id: user.id,
          profileId: user.providerProfile.id,
          email: user.email,
          name: user.providerProfile.name,
          businessName: user.providerProfile.businessName,
          phoneNumber: user.providerProfile.phoneNumber || 'N/A',
          address: user.providerProfile.address || 'N/A',
          logo: user.providerProfile.logo || null,
        }))
      
      setProviders(formattedProviders)
    } catch (error) {
      console.error("Error fetching providers:", error)
      showToast("Failed to load providers", "error")
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteProvider = async (id) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete provider")
      }
      
      showToast("Provider deleted successfully", "success")
      fetchProviders()
      setIsDeleteProviderDialogOpen(false)
    } catch (error) {
      console.error("Error deleting provider:", error)
      showToast(`Error: ${error.message}`, "error")
    }
  }
  
  // Categories methods
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/control-panel/categories')
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      showToast("Failed to load categories", "error")
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddCategory = async () => {
    try {
      if (!categoryFormData.name.trim()) {
        showToast("Category name is required", "error")
        return
      }
      
      const response = await fetch('/api/admin/control-panel/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryFormData.name.trim() })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add category")
      }
      
      showToast("Category added successfully", "success")
      fetchCategories()
      setIsAddingCategory(false)
      setCategoryFormData({ name: "" })
    } catch (error) {
      console.error("Error adding category:", error)
      showToast(`Error: ${error.message}`, "error")
    }
  }
  
  const handleUpdateCategory = async () => {
    try {
      if (!categoryFormData.name.trim()) {
        showToast("Category name is required", "error")
        return
      }
      
      const response = await fetch(`/api/admin/control-panel/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryFormData.name.trim() })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update category")
      }
      
      showToast("Category updated successfully", "success")
      fetchCategories()
      setIsEditingCategory(false)
      setSelectedCategory(null)
      setCategoryFormData({ name: "" })
    } catch (error) {
      console.error("Error updating category:", error)
      showToast(`Error: ${error.message}`, "error")
    }
  }
  
  const handleDeleteCategory = async () => {
    try {
      const response = await fetch(`/api/admin/control-panel/categories/${selectedCategory.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete category")
      }
      
      showToast("Category deleted successfully", "success")
      fetchCategories()
      setIsDeleteCategoryDialogOpen(false)
      setSelectedCategory(null)
    } catch (error) {
      console.error("Error deleting category:", error)
      showToast(`Error: ${error.message}`, "error")
    }
  }
  
  // Reviews methods
  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/control-panel/reviews')
      if (!response.ok) throw new Error("Failed to fetch reviews")
      const data = await response.json()
      setReviews(data)
    } catch (error) {
      console.error("Error fetching reviews:", error)
      showToast("Failed to load reviews", "error")
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteReview = async () => {
    try {
      const response = await fetch(`/api/admin/control-panel/reviews/${selectedReview.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete review")
      }
      
      showToast("Review deleted successfully", "success")
      fetchReviews()
      setIsDeleteReviewDialogOpen(false)
      setSelectedReview(null)
    } catch (error) {
      console.error("Error deleting review:", error)
      showToast(`Error: ${error.message}`, "error")
    }
  }
  
  // Settings methods
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/control-panel/settings')
      if (!response.ok) throw new Error("Failed to fetch settings")
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }
  
  const handleGeneralSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [key]: value
      }
    }))
  }
  
  const handleNotificationSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notification: {
        ...prev.notification,
        [key]: value
      }
    }))
  }
  
  const handleIntegrationSettingChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      integration: {
        ...prev.integration,
        [name]: value
      }
    }))
  }
  
  const handleSaveSettings = async (section) => {
    try {
      const response = await fetch('/api/admin/control-panel/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          section,
          settings: settings[section.toLowerCase()]
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to save ${section} settings`)
      }
      
      showToast(`${section} settings saved successfully!`, "success")
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error)
      showToast(`Error: ${error.message}`, "error")
    }
  }

  // Filtered data based on search terms
  const filteredProviders = providers.filter(provider => 
    provider.businessName.toLowerCase().includes(searchProviderTerm.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchProviderTerm.toLowerCase())
  )
  
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchCategoryTerm.toLowerCase())
  )
  
  const filteredReviews = reviews.filter(review =>
    review.userName?.toLowerCase().includes(searchReviewTerm.toLowerCase()) ||
    review.foodItemName?.toLowerCase().includes(searchReviewTerm.toLowerCase())
  )
  
  return (
    <div className="space-y-6">
      {ToastComponent}
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Control Panel</h1>
        <Badge variant="outline">Administrator</Badge>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 gap-4 w-full">
          <TabsTrigger value="providers">
            <Users className="h-4 w-4 mr-2" />
            Providers
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Layers className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <Star className="h-4 w-4 mr-2" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Providers Tab */}
        <TabsContent value="providers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Providers Management</CardTitle>
              <Button variant="outline" size="sm" onClick={fetchProviders}>
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search providers..."
                    className="pl-8"
                    value={searchProviderTerm}
                    onChange={(e) => setSearchProviderTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden md:table-cell">Address</TableHead>
                      <TableHead className="text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredProviders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No providers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProviders.map((provider) => (
                        <TableRow key={provider.id}>
                          <TableCell className="font-medium">
                            {provider.businessName}
                          </TableCell>
                          <TableCell>
                            <div>{provider.name}</div>
                            <div className="text-sm text-muted-foreground">{provider.phoneNumber}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{provider.email}</TableCell>
                          <TableCell className="hidden md:table-cell">{provider.address}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  // Redirect to user detail page
                                  window.location.href = `/admin-dashboard/users/${provider.id}`;
                                }}>
                                  <PenSquare className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedProvider(provider);
                                    setIsDeleteProviderDialogOpen(true);
                                  }}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Categories Management</CardTitle>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={fetchCategories}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                </Button>
                <Button size="sm" onClick={() => {
                  setCategoryFormData({ name: "" });
                  setIsAddingCategory(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" /> Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    className="pl-8"
                    value={searchCategoryTerm}
                    onChange={(e) => setSearchCategoryTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Food Items</TableHead>
                      <TableHead className="text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                          No categories found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          <TableCell>
                            {category.foodItemCount} items
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedCategory(category);
                                  setCategoryFormData({ name: category.name });
                                  setIsEditingCategory(true);
                                }}>
                                  <PenSquare className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedCategory(category);
                                    setIsDeleteCategoryDialogOpen(true);
                                  }}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Reviews Management</CardTitle>
              <Button variant="outline" size="sm" onClick={fetchReviews}>
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reviews..."
                    className="pl-8"
                    value={searchReviewTerm}
                    onChange={(e) => setSearchReviewTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Food Item</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead className="hidden md:table-cell">Comment</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredReviews.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No reviews found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell>
                            {review.userName}
                          </TableCell>
                          <TableCell>
                            {review.foodItemName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {review.rating}
                              <Star className="h-4 w-4 ml-1 text-yellow-400 fill-yellow-400" />
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell max-w-[200px]">
                            <div className="truncate">{review.comment || "No comment"}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedReview(review);
                                setIsDeleteReviewDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>
            
            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure basic site settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input 
                      id="siteName" 
                      value={settings.general.siteName}
                      onChange={(e) => handleGeneralSettingChange("siteName", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Input 
                      id="siteDescription"
                      value={settings.general.siteDescription}
                      onChange={(e) => handleGeneralSettingChange("siteDescription", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input 
                      id="contactEmail" 
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => handleGeneralSettingChange("contactEmail", e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="allowRegistrations"
                      checked={settings.general.allowRegistrations}
                      onCheckedChange={(checked) => handleGeneralSettingChange("allowRegistrations", checked)}
                    />
                    <Label htmlFor="allowRegistrations">Allow User Registrations</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="maintenanceMode"
                      checked={settings.general.maintenanceMode}
                      onCheckedChange={(checked) => handleGeneralSettingChange("maintenanceMode", checked)}
                    />
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  </div>
                  
                  <Button onClick={() => handleSaveSettings("General")} className="mt-4">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="enableEmailNotifications"
                      checked={settings.notification.enableEmailNotifications}
                      onCheckedChange={(checked) => handleNotificationSettingChange("enableEmailNotifications", checked)}
                    />
                    <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="enablePushNotifications"
                      checked={settings.notification.enablePushNotifications}
                      onCheckedChange={(checked) => handleNotificationSettingChange("enablePushNotifications", checked)}
                    />
                    <Label htmlFor="enablePushNotifications">Enable Push Notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="newOrderNotification"
                      checked={settings.notification.newOrderNotification}
                      onCheckedChange={(checked) => handleNotificationSettingChange("newOrderNotification", checked)}
                    />
                    <Label htmlFor="newOrderNotification">New Order Notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="lowInventoryAlert"
                      checked={settings.notification.lowInventoryAlert}
                      onCheckedChange={(checked) => handleNotificationSettingChange("lowInventoryAlert", checked)}
                    />
                    <Label htmlFor="lowInventoryAlert">Low Inventory Alerts</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="dailySummaryEmail"
                      checked={settings.notification.dailySummaryEmail}
                      onCheckedChange={(checked) => handleNotificationSettingChange("dailySummaryEmail", checked)}
                    />
                    <Label htmlFor="dailySummaryEmail">Daily Summary Email</Label>
                  </div>
                  
                  <Button onClick={() => handleSaveSettings("Notification")} className="mt-4">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Integration Settings */}
            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>Configure third-party service integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="googleMapsApiKey">Google Maps API Key</Label>
                    <Input 
                      id="googleMapsApiKey" 
                      name="googleMapsApiKey"
                      value={settings.integration.googleMapsApiKey}
                      onChange={handleIntegrationSettingChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                    <Input 
                      id="stripePublicKey" 
                      name="stripePublicKey"
                      value={settings.integration.stripePublicKey}
                      onChange={handleIntegrationSettingChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                    <Input 
                      id="stripeSecretKey" 
                      name="stripeSecretKey"
                      type="password"
                      value={settings.integration.stripeSecretKey}
                      onChange={handleIntegrationSettingChange}
                    />
                  </div>
                  
                  <Button onClick={() => handleSaveSettings("Integration")} className="mt-4">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
      
      {/* Provider Delete Confirmation */}
      <AlertDialog open={isDeleteProviderDialogOpen} onOpenChange={setIsDeleteProviderDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the provider "{selectedProvider?.businessName}" and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleDeleteProvider(selectedProvider?.id)}
            >
              Delete Provider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Category Add Dialog */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCategoryFormData({ name: "" });
              setIsAddingCategory(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Category Edit Dialog */}
      <Dialog open={isEditingCategory} onOpenChange={setIsEditingCategory}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCategoryFormData({ name: "" });
              setSelectedCategory(null);
              setIsEditingCategory(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory}>Update Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Category Delete Confirmation */}
      <AlertDialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "{selectedCategory?.name}".
              {selectedCategory?.foodItemCount > 0 && 
                ` This category is used by ${selectedCategory.foodItemCount} food items, which will also be affected.`}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteCategory}
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Review Delete Confirmation */}
      <AlertDialog open={isDeleteReviewDialogOpen} onOpenChange={setIsDeleteReviewDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this review. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteReview}
            >
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Users({ className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function Layers({ className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}
