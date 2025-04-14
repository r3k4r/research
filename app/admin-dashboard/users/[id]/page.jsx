"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation" // Add useParams import
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  User as UserIcon, 
  Calendar, 
  Shield, 
  Clock, 
  Check, 
  X, 
  Edit, 
  Trash 
} from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const SingleUser = ({ params }) => {
  // Use the useParams hook instead of destructuring directly from props
  const routeParams = useParams()
  const id = routeParams.id // Access the id safely
  
  const router = useRouter()
  const { showToast, hideToast, ToastComponent } = useToast()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "USER",
    profileData: {
      // User profile fields
      name: "",
      location: "",
      phoneNumber: "",
      gender: "",
      image: "",
      // Provider profile fields
      name: "",
      businessName: "",
      description: "",
      address: "",
      businessHours: ""
    }
  })

  // Define resetForm function that was missing
  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      role: "USER",
      profileData: {
        name: "",
        location: "",
        phoneNumber: "",
        gender: "",
        image: "",
        businessName: "",
        description: "",
        address: "",
        businessHours: ""
      }
    });
  }

  // Define handleInputChange function that was missing
  const handleInputChange = (e, section = null) => {
    const { name, value } = e.target;
    
    if (section) {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  }

  // Define refreshData function that was missing
  const refreshData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${id}`);
      
      if (!res.ok) {
        throw new Error("Failed to refresh user data");
      }
      
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error(error);
      showToast("Failed to refresh user data", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    } catch (error) {
      return "Invalid Date"
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/users/${id}`)
        
        if (!res.ok) {
          throw new Error("Failed to fetch user data")
        }
        
        const data = await res.json()
        setUser(data.user)
      } catch (error) {
        console.error(error)
        showToast("Error loading user details", "error")
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchUserData()
    }
  }, [id]) // Update dependency array to use the new id

  const handleDeleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      })
      
      if (!res.ok) {
        throw new Error("Failed to delete user")
      }
      
      showToast("User deleted successfully", "success")
      
      setTimeout(() => {
        router.push("/admin/users")
      }, 1500)
    } catch (error) {
      console.error(error)
      showToast("Error deleting user", "error")
    }
  }


  const handleEditUser = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${id}`);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch user details");
      }
      
      const { user } = await res.json();
      
      // Populate form with user data
      const newFormData = {
        id: user.id,
        email: user.email,
        password: "",  // Don't populate password for security
        role: user.role,
        profileData: {
          name: "",
          location: "",
          phoneNumber: "",
          gender: "",
          image: "",
          businessName: "",
          description: "",
          address: "",
          businessHours: ""
        }
      };
      
      // Add USER or PROVIDER specific data
      if (user.role === "USER" && user.profile) {
        newFormData.profileData = {
          ...newFormData.profileData,
          name: user.profile.name || "",
          location: user.profile.location || "",
          phoneNumber: user.profile.phoneNumber || "",
          gender: user.profile.gender || "",
          image: user.profile.image || ""
        };
      } else if (user.role === "PROVIDER" && user.providerProfile) {
        newFormData.profileData = {
          ...newFormData.profileData,
          name: user.providerProfile.name || "",
          businessName: user.providerProfile.businessName || "",
          description: user.providerProfile.description || "",
          address: user.providerProfile.address || "",
          phoneNumber: user.providerProfile.phoneNumber || "",
          businessHours: user.providerProfile.businessHours || "",
          image: user.providerProfile.logo || ""
        };
      }
      
      setFormData(newFormData);
      setIsEditingUser(true);
    } catch (err) {
      console.error(err);
      // Fix: Use showToast instead of toast
      showToast(err.message || "Failed to load user for editing", "error");
    } finally {
      setLoading(false);
    }
  }

  
 const handleUpdateUser = async () => {
  try {
    setLoading(true);
    const userId = formData.id;
    
    if (!userId) {
      throw new Error("User ID is missing");
    }
    
    // Create update payload including all necessary data
    const payload = {
      email: formData.email,
      role: formData.role,
      profileData: formData.profileData
    };
    
    // Only include password if it's provided
    if (formData.password) {
      payload.password = formData.password;
    }
    
    // Call API to update user with all data in one request
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      // Handle non-JSON responses properly
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await res.text();
        console.error("Non-JSON response:", errorText);
        throw new Error("Received invalid response from server. Please try again.");
      }
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user");
      }
      
      showToast("User updated successfully", "success");
      
      // Reset form and close dialog
      resetForm();
      setIsEditingUser(false);
      
      // Refresh data
      refreshData();
    } catch (error) {
      if (error.message.includes("Unexpected token")) {
        throw new Error("Server returned an invalid response. Please try again later.");
      } else {
        throw error;
      }
    }
  } catch (err) {
    console.error(err);
    showToast(err.message || "Failed to update user", "error");
  } finally {
    setLoading(false);
  }
}

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg">Loading user details...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-4">
        {ToastComponent}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-xl font-semibold">User Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <p>The user you're looking for doesn't exist or has been deleted.</p>
            <Button className="mt-4" onClick={() => router.push('/admin/users')}>
              Return to User List
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isProvider = user.role === "PROVIDER"
  const profile = isProvider ? user.providerProfile : user.profile
  
  
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN": return "bg-red-100 text-red-800"
      case "PROVIDER": return "bg-blue-100 text-blue-800"
      default: return "bg-green-100 text-green-800"
    }
  }

  return (
    <div className="space-y-6">
      {ToastComponent}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-xl font-semibold md:text-2xl">
            User Details
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleEditUser(user.id)}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteUser}
          >
            <Trash className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main User Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>User Information</span>
              <Badge className={`${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </Badge>
            </CardTitle>
            <CardDescription>
              Basic user account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.image || isProvider && profile?.logo ? (
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden">
                  <img 
                    src={isProvider ? profile?.logo : profile?.image} 
                    alt={`${profile?.name}'s avatar`}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/128?text=No+Image"
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon size={48} className="text-gray-400" />
                </div>
              </div>
            )}
            
            <div className="text-center">
              <h2 className="text-xl font-semibold">{profile?.name || "No Name"}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Email:</span> 
                <span className="text-gray-600">{user.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Joined:</span> 
                <span className="text-gray-600">{formatDate(user.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Email Verified:</span>
                {user.emailVerified ? (
                  <span className="text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" /> Yes
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" /> No
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Two-Factor Auth:</span>
                {user.twoFactorEnabled ? (
                  <span className="text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" /> Enabled
                  </span>
                ) : (
                  <span className="text-gray-600 flex items-center">
                    <X className="h-4 w-4 mr-1" /> Disabled
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {isProvider ? "Provider Details" : "User Profile"}
            </CardTitle>
            <CardDescription>
              {isProvider 
                ? "Business and service provider information" 
                : "Personal information and preferences"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                {isProvider && <TabsTrigger value="business">Business Info</TabsTrigger>}
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                {isProvider ? (
                  // Provider profile details
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Business Name</p>
                        <p>{profile?.businessName || "N/A"}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Contact Name</p>
                        <p>{profile?.name || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          {profile?.phoneNumber || "Not provided"}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          {profile?.address || "Not provided"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Business Hours</p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {profile?.businessHours || "Not specified"}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-gray-700">
                        {profile?.description || "No description provided."}
                      </p>
                    </div>
                  </>
                ) : (
                  // Regular user profile details
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p>{profile?.name || "N/A"}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Gender</p>
                        <p className="capitalize">{profile?.gender || "Not specified"}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          {profile?.phoneNumber || "Not provided"}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          {profile?.location || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
              
              {isProvider && (
                <TabsContent value="business" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Business Performance</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-500">No performance data available yet.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Recent Products</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-500">No products listed yet.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
              
              <TabsContent value="activity" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Account Activity</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <span>Account Created</span>
                      <span className="text-gray-500">{formatDate(user.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <span>Last Updated</span>
                      <span className="text-gray-500">{formatDate(user.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <span>Email Verified</span>
                      <span className="text-gray-500">{user.emailVerified ? formatDate(user.emailVerified) : "Not verified"}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-end">
            <Button variant="outline" onClick={() => router.back()}>
              Back to Users List
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Edit User Modal */}
       {/* Edit User Dialog */}
       <Dialog 
        open={isEditingUser} 
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
          }
          setIsEditingUser(open);
        }}
      >
        <DialogContent className="max-w-md sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="profile">Profile Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange(e)}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep unchanged"
                  value={formData.password}
                  onChange={(e) => handleInputChange(e)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank if you don't want to change the password.
                </p>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="role">User Role <span className="text-red-500">*</span></Label>
                <Select 
                  name="role"
                  value={formData.role} 
                  onValueChange={(value) => setFormData({...formData, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Regular User</SelectItem>
                    <SelectItem value="PROVIDER">Provider</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="profile" className="space-y-4 pt-4">
              {/* Fields common to all roles */}
              <div className="space-y-1">
                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Full name"
                  value={formData.profileData.name}
                  onChange={(e) => handleInputChange(e, 'profileData')}
                />
              </div>

              {formData.role === "USER" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        placeholder="+1 234 567 8900"
                        value={formData.profileData.phoneNumber}
                        onChange={(e) => handleInputChange(e, 'profileData')}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="gender">Gender</Label>
                      <Select 
                        name="gender"
                        value={formData.profileData.gender || ""}
                        onValueChange={(value) => setFormData({
                          ...formData, 
                          profileData: {...formData.profileData, gender: value}
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="City, Country"
                      value={formData.profileData.location}
                      onChange={(e) => handleInputChange(e, 'profileData')}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="image">Profile Image URL</Label>
                    <Input
                      id="image"
                      name="image"
                      placeholder="https://example.com/image.jpg"
                      value={formData.profileData.image}
                      onChange={(e) => handleInputChange(e, 'profileData')}
                    />
                  </div>
                </>
              )}
              
              {formData.role === "PROVIDER" && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="businessName">Business Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      required
                      placeholder="Business name"
                      value={formData.profileData.businessName}
                      onChange={(e) => handleInputChange(e, 'profileData')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        required
                        placeholder="+1 234 567 8900"
                        value={formData.profileData.phoneNumber}
                        onChange={(e) => handleInputChange(e, 'profileData')}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                      <Input
                        id="address"
                        name="address"
                        required
                        placeholder="123 Business St"
                        value={formData.profileData.address}
                        onChange={(e) => handleInputChange(e, 'profileData')}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="businessHours">Business Hours</Label>
                    <Input
                      id="businessHours"
                      name="businessHours"
                      placeholder="Mon-Fri: 9am-5pm"
                      value={formData.profileData.businessHours}
                      onChange={(e) => handleInputChange(e, 'profileData')}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your business..."
                      value={formData.profileData.description}
                      onChange={(e) => handleInputChange(e, 'profileData')}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="image">Business Logo URL</Label>
                    <Input
                      id="image"
                      name="image"
                      placeholder="https://example.com/logo.jpg"
                      value={formData.profileData.image}
                      onChange={(e) => handleInputChange(e, 'profileData')}
                    />
                  </div>
                </>
              )}
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  resetForm();
                  setIsEditingUser(false);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser} disabled={loading}>
                  {loading ? "Updating..." : "Update User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

    </div>
  )
}

export default SingleUser