"use client"

import { useState, useEffect, useRef } from "react"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
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
  Settings,
  AlertCircle
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod" // Import zod for validation

// Define Zod schema for provider form validation
const providerSchema = z.object({
  email: z.string().email({ message: "Invalid email address format" }),
  password: z.string().optional(), // Password is optional when editing
  role: z.literal("PROVIDER"),
  profileData: z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters" }),
    businessName: z.string().min(2, { message: "Business name is required" }),
    description: z.string().nullable().optional(),
    address: z.string().min(5, { message: "Valid address is required" }),
    phoneNumber: z.string().min(8, { message: "Valid phone number is required" }),
    businessHours: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),
  })
});

// Define schema for creating a provider (with required password)
const providerCreateSchema = providerSchema.extend({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character" })
});

// Create a new CustomDialog component that will properly handle cleanup
const CustomDialog = ({ open, onOpenChange, title, description, children, footer }) => {
  const dialogRef = useRef(null);

  // Ensure proper cleanup when dialog closes
  useEffect(() => {
    if (!open && dialogRef.current) {
      // Force any lingering portal elements to be removed
      const portalRoot = document.querySelector('[data-portal-root="true"]');
      if (portalRoot) {
        portalRoot.innerHTML = '';
      }
      
      // Ensure body style is reset
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={dialogRef} className="overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>
        <div className="py-4">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};

// Custom AlertDialog component for confirmation dialogs
const CustomAlertDialog = ({ open, onOpenChange, title, description, onCancel, onAction, actionLabel, actionVariant = "default" }) => {
  const dialogRef = useRef(null);

  // Ensure proper cleanup when dialog closes
  useEffect(() => {
    if (!open && dialogRef.current) {
      // Force any lingering portal elements to be removed
      const portalRoot = document.querySelector('[data-portal-root="true"]');
      if (portalRoot) {
        portalRoot.innerHTML = '';
      }
      
      // Ensure body style is reset
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    }
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent ref={dialogRef}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className={actionVariant === "destructive" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
            onClick={onAction}
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

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
  const [isAddingProvider, setIsAddingProvider] = useState(false)
  const [providerFormData, setProviderFormData] = useState({
    email: "",
    password: "",
    role: "PROVIDER",
    profileData: {
      name: "",
      businessName: "",
      description: "",
      address: "",
      phoneNumber: "",
      businessHours: "",
      logo: ""
    }
  })
  const [formErrors, setFormErrors] = useState({})
  
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

  // Add new useEffect for global overlay cleanup on tab change
  useEffect(() => {
    const cleanupOverlays = () => {
      // Ensure all overlay states are reset
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
      
      // Find any portal roots and clear them
      const portalRoots = document.querySelectorAll('[data-portal-root="true"], [role="dialog"]');
      portalRoots.forEach(root => {
        if (!root.hasAttribute('data-state') || root.getAttribute('data-state') !== 'open') {
          root.remove();
        }
      });
      
      // Force remove any orphaned overlays
      const overlays = document.querySelectorAll('[role="presentation"]');
      overlays.forEach(overlay => {
        if (!overlay.parentElement || !overlay.parentElement.classList.contains('dialog-open')) {
          overlay.remove();
        }
      });
    };
    
    // Clean up overlays on tab change
    cleanupOverlays();
    
    // Set up mutation observer to watch for orphaned overlays
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
          // Check if a dialog was removed but left orphaned overlays
          cleanupOverlays();
        }
      });
    });
    
    // Start observing document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
      cleanupOverlays();
    };
  }, [activeTab]);

  // Providers methods
  const fetchProviders = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/control-panel/provider')
      if (!response.ok) throw new Error("Failed to fetch providers")
      const data = await response.json()
      setProviders(data)
    } catch (error) {
      console.error("Error fetching providers:", error)
      showToast("Failed to load providers", "error")
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteProvider = async (id) => {
    try {
      const response = await fetch(`/api/admin/control-panel/provider?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete provider")
      }
      
      showToast("Provider deleted successfully", "success")
      fetchProviders()
      setIsDeleteProviderDialogOpen(false);
    } catch (error) {
      console.error("Error deleting provider:", error)
      showToast(`Error: ${error.message}`, "error")
    }
  }

  const resetProviderForm = () => {
    setProviderFormData({
      email: "",
      password: "",
      role: "PROVIDER",
      profileData: {
        name: "",
        businessName: "",
        description: "",
        address: "",
        phoneNumber: "",
        businessHours: "",
        logo: ""
      }
    });
    setFormErrors({});
    setSelectedProvider(null);
  }
  
  const handleProviderInputChange = (e, section = null) => {
    const { name, value } = e.target;
    
    // Clear error when editing the field
    if (section) {
      setFormErrors(prev => ({...prev, [`${section}.${name}`]: undefined}));
    } else {
      setFormErrors(prev => ({...prev, [name]: undefined}));
    }
    
    if (section) {
      setProviderFormData({
        ...providerFormData,
        [section]: {
          ...providerFormData[section],
          [name]: value
        }
      });
    } else {
      setProviderFormData({
        ...providerFormData,
        [name]: value
      });
    }
  }
  
  const validateProviderForm = (isEditing = false) => {
    try {
      // Use the appropriate schema based on whether we're editing or creating
      const schema = isEditing ? providerSchema : providerCreateSchema;
      
      // If editing and password is empty, remove it from validation
      const dataToValidate = isEditing && !providerFormData.password 
        ? { ...providerFormData, password: undefined }
        : providerFormData;
      
      // Validate with Zod schema
      schema.parse(dataToValidate);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Transform Zod errors into form errors
        const errors = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  }

  const handleEditProvider = (provider) => {
    // Set selected provider
    setSelectedProvider(provider);
    
    // Populate the form with provider data
    setProviderFormData({
      id: provider.id,
      email: provider.email,
      password: "", // Password is empty when editing
      role: "PROVIDER",
      profileId: provider.profileId,
      profileData: {
        name: provider.name || "",
        businessName: provider.businessName || "",
        description: provider.description || "",
        address: provider.address || "",
        phoneNumber: provider.phoneNumber || "",
        businessHours: provider.businessHours || "",
        logo: provider.logo || ""
      }
    });
    
    // Clear any previous errors
    setFormErrors({});
    
    // Open the editing dialog
    setIsEditingProvider(true);
  }
  
  const handleUpdateProvider = async () => {
    try {
      setLoading(true);
      
      // First validate the form with Zod (in edit mode)
      if (!validateProviderForm(true)) {
        setLoading(false);
        return;
      }
      
      const payload = {
        id: providerFormData.id,
        email: providerFormData.email,
        password: providerFormData.password,
        profileData: {
          name: providerFormData.profileData.name,
          businessName: providerFormData.profileData.businessName,
          description: providerFormData.profileData.description || null,
          address: providerFormData.profileData.address,
          phoneNumber: providerFormData.profileData.phoneNumber,
          businessHours: providerFormData.profileData.businessHours || null,
          logo: providerFormData.profileData.logo || null
        }
      };
      
      const res = await fetch('/api/admin/control-panel/provider', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const data = await res.json();
        // Check for duplicate email error
        if (data.error && data.error.includes("email already exists")) {
          setFormErrors(prev => ({...prev, email: "This email is already registered"}));
          setLoading(false);
          return;
        }
        throw new Error(data.error || "Failed to update provider");
      }
      
      showToast("Provider updated successfully", "success");
      
      resetProviderForm();
      setIsEditingProvider(false);
      
      fetchProviders();
    } catch (error) {
      console.error("Error updating provider:", error);
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  }
  
  const handleAddProvider = async () => {
    try {
      setLoading(true);
      
      // First validate the form with Zod (in create mode)
      if (!validateProviderForm(false)) {
        setLoading(false);
        return;
      }
      
      const payload = {
        email: providerFormData.email,
        password: providerFormData.password,
        profileData: {
          name: providerFormData.profileData.name,
          businessName: providerFormData.profileData.businessName,
          description: providerFormData.profileData.description || null,
          address: providerFormData.profileData.address,
          phoneNumber: providerFormData.profileData.phoneNumber,
          businessHours: providerFormData.profileData.businessHours || null,
          logo: providerFormData.profileData.logo || null
        }
      };
      
      const res = await fetch('/api/admin/control-panel/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Handle specific backend validation errors
        if (data.error) {
          if (data.error.includes("email already exists")) {
            setFormErrors(prev => ({...prev, email: "This email is already registered"}));
          } else if (data.error.includes("business name already exists")) {
            setFormErrors(prev => ({...prev, "profileData.businessName": "This business name is already registered"}));
          } else if (data.error.includes("phone number already exists")) {
            setFormErrors(prev => ({...prev, "profileData.phoneNumber": "This phone number is already registered"}));
          } else {
            throw new Error(data.error);
          }
          setLoading(false);
          return;
        }
        throw new Error("Failed to create provider");
      }
      
      showToast("Provider created successfully", "success");
      
      resetProviderForm();
      setIsAddingProvider(false);
      
      fetchProviders();
    } catch (error) {
      console.error("Error adding provider:", error);
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  }
  
  // Helper to get field error
  const getFieldError = (field, section = null) => {
    return section ? formErrors[`${section}.${field}`] : formErrors[field];
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

  const resetCategoryForm = () => {
    setCategoryFormData({ name: "" });
    setSelectedCategory(null);
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
    <div className="space-y-6" id="control-panel-root">
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
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={fetchProviders}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                </Button>
                <Button size="sm" onClick={() => {
                  resetProviderForm();
                  setIsAddingProvider(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" /> Add Provider
                </Button>
              </div>
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
                                <DropdownMenuItem onClick={() => handleEditProvider(provider)}>
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
      <CustomAlertDialog 
        open={isDeleteProviderDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteProviderDialogOpen(open);
          if (!open) setSelectedProvider(null);
        }}
        title="Are you sure?"
        description={`This will permanently delete the provider "${selectedProvider?.businessName}" and all associated data. This action cannot be undone.`}
        onCancel={() => setIsDeleteProviderDialogOpen(false)}
        onAction={() => handleDeleteProvider(selectedProvider?.id)}
        actionLabel="Delete Provider"
        actionVariant="destructive"
      />
      
      {/* Category Add Sheet */}
      <Sheet 
        open={isAddingCategory} 
        onOpenChange={(open) => {
          setIsAddingCategory(open);
          if (!open) {
            setCategoryFormData({ name: "" });
            // Force cleanup
            document.body.style.pointerEvents = '';
            document.body.style.overflow = '';
          }
        }}
      >
        <SheetContent
          onCloseAutoFocus={(e) => {
            // Prevent focus issues
            e.preventDefault();
            document.getElementById('control-panel-root').focus();
          }}
        >
          <SheetHeader>
            <SheetTitle>Add Category</SheetTitle>
            <SheetDescription>
              Create a new category for food items.
            </SheetDescription>
          </SheetHeader>
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
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      {/* Category Edit Sheet */}
      <Sheet 
        open={isEditingCategory} 
        onOpenChange={(open) => {
          setIsEditingCategory(open);
          if (!open) {
            resetCategoryForm();
            // Force cleanup
            document.body.style.pointerEvents = '';
            document.body.style.overflow = '';
          }
        }}
      >
        <SheetContent
          onCloseAutoFocus={(e) => {
            // Prevent focus issues
            e.preventDefault();
            document.getElementById('control-panel-root').focus();
          }}
        >
          <SheetHeader>
            <SheetTitle>Edit Category</SheetTitle>
            <SheetDescription>
              Update the name of the category.
            </SheetDescription>
          </SheetHeader>
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
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button onClick={handleUpdateCategory}>Update Category</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      {/* Category Delete Confirmation */}
      <CustomAlertDialog
        open={isDeleteCategoryDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteCategoryDialogOpen(open);
          if (!open) setSelectedCategory(null);
        }}
        title="Are you sure?"
        description={`This will permanently delete the category "${selectedCategory?.name}".
          ${selectedCategory?.foodItemCount > 0 ? ` This category is used by ${selectedCategory.foodItemCount} food items, which will also be affected.` : ''}
          This action cannot be undone.`}
        onCancel={() => setIsDeleteCategoryDialogOpen(false)}
        onAction={handleDeleteCategory}
        actionLabel="Delete Category"
        actionVariant="destructive"
      />
      
      {/* Review Delete Confirmation */}
      <CustomAlertDialog
        open={isDeleteReviewDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteReviewDialogOpen(open);
          if (!open) setSelectedReview(null);
        }}
        title="Are you sure?"
        description="This will permanently delete this review. This action cannot be undone."
        onCancel={() => setIsDeleteReviewDialogOpen(false)}
        onAction={handleDeleteReview}
        actionLabel="Delete Review"
        actionVariant="destructive"
      />
      
      {/* Add Provider Sheet */}
      <Sheet 
        open={isAddingProvider} 
        onOpenChange={(open) => {
          setIsAddingProvider(open);
          if (!open) {
            resetProviderForm();
            // Force cleanup
            document.body.style.pointerEvents = '';
            document.body.style.overflow = '';
          }
        }}
      >
        <SheetContent 
          className="sm:max-w-[550px] overflow-y-auto" 
          onCloseAutoFocus={(e) => {
            // Prevent focus issues
            e.preventDefault();
            document.getElementById('control-panel-root').focus();
          }}
        >
          <SheetHeader>
            <SheetTitle>Add New Provider</SheetTitle>
            <SheetDescription>
              Enter the details for the new provider account and business.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            {/* Account Information Section */}
            <div className="bg-muted/40 p-3 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="provider-email">Email Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="provider-email"
                    name="email"
                    type="email"
                    value={providerFormData.email}
                    onChange={(e) => handleProviderInputChange(e)}
                    placeholder="provider@example.com"
                    required
                    className={getFieldError('email') ? "border-red-500" : ""}
                  />
                  {getFieldError('email') && (
                    <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {getFieldError('email')}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="provider-password">Password <span className="text-red-500">*</span></Label>
                  <Input
                    id="provider-password"
                    name="password"
                    type="password"
                    value={providerFormData.password}
                    onChange={(e) => handleProviderInputChange(e)}
                    placeholder="••••••••"
                    required
                    className={getFieldError('password') ? "border-red-500" : ""}
                  />
                  {getFieldError('password') ? (
                    <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {getFieldError('password')}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground mt-1">
                      Password must have at least 8 characters, one uppercase letter, and one special character
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Business Information */}
            <div className="bg-muted/40 p-3 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Business Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="provider-businessName">Business Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="provider-businessName"
                    name="businessName"
                    value={providerFormData.profileData.businessName}
                    onChange={(e) => handleProviderInputChange(e, 'profileData')}
                    placeholder="Business name"
                    required
                    className={getFieldError('businessName', 'profileData') ? "border-red-500" : ""}
                  />
                  {getFieldError('businessName', 'profileData') && (
                    <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {getFieldError('businessName', 'profileData')}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="provider-name">Contact Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="provider-name"
                      name="name"
                      value={providerFormData.profileData.name}
                      onChange={(e) => handleProviderInputChange(e, 'profileData')}
                      placeholder="Full name"
                      required
                      className={getFieldError('name', 'profileData') ? "border-red-500" : ""}
                    />
                    {getFieldError('name', 'profileData') && (
                      <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" /> {getFieldError('name', 'profileData')}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="provider-phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="provider-phoneNumber"
                      name="phoneNumber"
                      value={providerFormData.profileData.phoneNumber}
                      onChange={(e) => handleProviderInputChange(e, 'profileData')}
                      placeholder="+964 0000 000 0000"
                      required
                      className={getFieldError('phoneNumber', 'profileData') ? "border-red-500" : ""}
                    />
                    {getFieldError('phoneNumber', 'profileData') && (
                      <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" /> {getFieldError('phoneNumber', 'profileData')}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="provider-address">Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="provider-address"
                    name="address"
                    value={providerFormData.profileData.address}
                    onChange={(e) => handleProviderInputChange(e, 'profileData')}
                    placeholder="123 Business St, City"
                    required
                    className={getFieldError('address', 'profileData') ? "border-red-500" : ""}
                  />
                  {getFieldError('address', 'profileData') && (
                    <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {getFieldError('address', 'profileData')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="bg-muted/40 p-3 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="provider-businessHours">Business Hours</Label>
                  <Input
                    id="provider-businessHours"
                    name="businessHours"
                    value={providerFormData.profileData.businessHours}
                    onChange={(e) => handleProviderInputChange(e, 'profileData')}
                    placeholder="Mon-Fri: 9am-5pm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="provider-description">Description</Label>
                  <Textarea
                    id="provider-description"
                    name="description"
                    value={providerFormData.profileData.description}
                    onChange={(e) => handleProviderInputChange(e, 'profileData')}
                    placeholder="Describe the business..."
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="provider-logo">Logo URL</Label>
                  <Input
                    id="provider-logo"
                    name="logo"
                    value={providerFormData.profileData.logo}
                    onChange={(e) => handleProviderInputChange(e, 'profileData')}
                    placeholder="https://example.com/logo.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button onClick={handleAddProvider} disabled={loading}>
              {loading ? "Creating..." : "Add Provider"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      {/* Edit Provider Sheet */}
      <Sheet 
        open={isEditingProvider} 
        onOpenChange={(open) => {
          setIsEditingProvider(open);
          if (!open) {
            resetProviderForm();
            // Force cleanup
            document.body.style.pointerEvents = '';
            document.body.style.overflow = '';
          }
        }}
      >
        <SheetContent 
          className="sm:max-w-[550px] overflow-y-auto"
          onCloseAutoFocus={(e) => {
            // Prevent focus issues
            e.preventDefault(); 
            document.getElementById('control-panel-root').focus();
          }}
        >
          <SheetHeader>
            <SheetTitle>Edit Provider</SheetTitle>
            <SheetDescription>
              Update the provider's account and business details.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            {/* Account Information Section */}
            <div className="bg-muted/40 p-3 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-provider-email">Email Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-provider-email"
                    name="email"
                    type="email"
                    value={providerFormData.email}
                    onChange={(e) => handleProviderInputChange(e)}
                    placeholder="provider@example.com"
                    required
                    className={getFieldError('email') ? "border-red-500" : ""}
                  />
                  {getFieldError('email') && (
                    <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {getFieldError('email')}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="edit-provider-password">Password</Label>
                  <Input
                    id="edit-provider-password"
                    name="password"
                    type="password"
                    value={providerFormData.password}
                    onChange={(e) => handleProviderInputChange(e)}
                    placeholder="Leave empty to keep current password"
                    className={getFieldError('password') ? "border-red-500" : ""}
                  />
                  {getFieldError('password') ? (
                    <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {getFieldError('password')}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground mt-1">
                      Leave blank to keep the current password, or enter a new password
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Business Information Section */}
            <div className="bg-muted/40 p-3 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Business Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-provider-businessName">Business Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-provider-businessName"
                    name="businessName"
                    value={providerFormData.profileData.businessName}
                    onChange={(e) => handleProviderInputChange(e, 'profileData')}
                    placeholder="Business name"
                    required
                    className={getFieldError('businessName', 'profileData') ? "border-red-500" : ""}
                  />
                  {getFieldError('businessName', 'profileData') && (
                    <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {getFieldError('businessName', 'profileData')}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-provider-name">Contact Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="edit-provider-name"
                      name="name"
                      value={providerFormData.profileData.name}
                      onChange={(e) => handleProviderInputChange(e, 'profileData')}
                      placeholder="Full name"
                      required
                      className={getFieldError('name', 'profileData') ? "border-red-500" : ""}
                    />
                    {getFieldError('name', 'profileData') && (
                      <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" /> {getFieldError('name', 'profileData')}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-provider-phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="edit-provider-phoneNumber"
                      name="phoneNumber"
                      value={providerFormData.profileData.phoneNumber}
                      onChange={(e) => handleProviderInputChange(e, 'profileData')}
                      placeholder="+964 0000 000 0000"
                      required
                      className={getFieldError('phoneNumber', 'profileData') ? "border-red-500" : ""}
                    />
                    {getFieldError('phoneNumber', 'profileData') && (
                      <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" /> {getFieldError('phoneNumber', 'profileData')}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-provider-address">Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-provider-address"
                    name="address"
                    value={providerFormData.profileData.address}
                    onChange={(e) => handleProviderInputChange(e, 'profileData')}
                    placeholder="123 Business St, City"
                    required
                    className={getFieldError('address', 'profileData') ? "border-red-500" : ""}
                  />
                  {getFieldError('address', 'profileData') && (
                    <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {getFieldError('address', 'profileData')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Additional Information Section */}
            <div className="bg-muted/40 p-3 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-provider-businessHours">Business Hours</Label>
                  <Input
                    id="edit-provider-businessHours"
                    name="businessHours"
                    value={providerFormData.profileData.businessHours}
                    onChange={(e) => handleProviderInputChange(e, 'profileData')}
                    placeholder="Mon-Fri: 9am-5pm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-provider-description">Description</Label>
                  <Textarea
                    id="edit-provider-description"
                    name="description"
                    value={providerFormData.profileData.description}
                    onChange={(e) => handleProviderInputChange(e, 'profileData')}
                    placeholder="Describe the business..."
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-provider-logo">Logo URL</Label>
                  <Input
                    id="edit-provider-logo"
                    name="logo"
                    value={providerFormData.profileData.logo}
                    onChange={(e) => handleProviderInputChange(e, 'profileData')}
                    placeholder="https://example.com/logo.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button onClick={handleUpdateProvider} disabled={loading}>
              {loading ? "Updating..." : "Update Provider"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
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
