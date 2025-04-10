"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, UserPlus, Trash2, PenSquare, MoreVertical, ChevronRight, RefreshCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation" 
import { useToast } from "@/components/ui/toast" // This is your custom toast

export default function UsersPage() {
  // Use the custom toast hook correctly
  const { showToast, hideToast, ToastComponent } = useToast()
  const router = useRouter() 
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  
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
  
  // Add this function to handle opening the Add User dialog properly
  const handleOpenAddUserDialog = () => {
    // Reset the form first before opening dialog
    resetForm();
    setIsAddingUser(true);
  }

  // Fetch users with pagination and filters
  const fetchUsers = async () => {
    try {
      setLoading(true)
      let url = `/api/admin/users?page=${currentPage}&limit=10`
      
      if (selectedRole !== "all") {
        url += `&role=${selectedRole}`
      }
      
      if (searchTerm) {
        url += `&search=${searchTerm}`
      }
      
      const res = await fetch(url, {
        cache: 'no-store' // Prevent caching
      });
      const data = await res.json();
      
      if (data.users) {
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
      }
    } catch (err) {
      console.log(err);
      // Use your custom toast
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  }

  // Refresh data function to force updates
  const refreshData = () => {
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedRole, searchTerm])

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

  const handleAddUser = async () => {
    try {
      setLoading(true);
      
      // Create a payload based on the role
      const payload = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        profileData: {}
      };
      
      // Add appropriate profile data based on role
      if (formData.role === "USER") {
        payload.profileData = {
          name: formData.profileData.name,
          location: formData.profileData.location || null,
          phoneNumber: formData.profileData.phoneNumber || null,
          gender: formData.profileData.gender || null,
        };
      } else if (formData.role === "PROVIDER") {
        payload.profileData = {
          name: formData.profileData.name,
          businessName: formData.profileData.businessName,
          description: formData.profileData.description || null,
          address: formData.profileData.address,
          phoneNumber: formData.profileData.phoneNumber,
          businessHours: formData.profileData.businessHours || null,
          logo: formData.profileData.image || null
        };
      }
      
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }
      
      // Use your custom toast
      showToast("User created successfully", "success");
      
      // Reset form and close dialog first for better UX
      resetForm();
      setIsAddingUser(false);
      
      // Then refresh data
      refreshData();
    } catch (err) {
      console.error(err);
      // Use your custom toast
      showToast(err.message || "Failed to create user", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleViewUser = (userId) => {
    router.push(`/admin/users/${userId}`);
  }

  const handleEditUser = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${userId}`);
      
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
      
      // Create update payload (similar to add but without password unless provided)
      const payload = {
        email: formData.email,
        role: formData.role
      };
      
      // Only include password if it's provided (for changing password)
      if (formData.password) {
        payload.password = formData.password;
      }
      
      // Call API to update user
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user");
      }
      
      // Update profile based on role
      if (formData.role === "USER") {
        await updateUserProfile(userId);
      } else if (formData.role === "PROVIDER") {
        await updateProviderProfile(userId);
      }
      
      // Use your custom toast
      showToast("User updated successfully", "success");
      
      // Reset form and close dialog
      resetForm();
      setIsEditingUser(false);
      
      // Refresh data
      refreshData();
    } catch (err) {
      console.error(err);
      // Use your custom toast
      showToast(err.message || "Failed to update user", "error");
    } finally {
      setLoading(false);
    }
  }

  const updateUserProfile = async (userId) => {
    if (!userId) throw new Error("User ID is missing");
    
    const profileData = {
      name: formData.profileData.name,
      location: formData.profileData.location || null,
      phoneNumber: formData.profileData.phoneNumber || null,
      gender: formData.profileData.gender || null,
    };
    
    const res = await fetch(`/api/admin/users/${userId}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || "Failed to update user profile");
    }
    
    return data;
  }

  const updateProviderProfile = async (userId) => {
    if (!userId) throw new Error("User ID is missing");
    
    const profileData = {
      name: formData.profileData.name,
      businessName: formData.profileData.businessName,
      description: formData.profileData.description || null,
      address: formData.profileData.address,
      phoneNumber: formData.profileData.phoneNumber,
      businessHours: formData.profileData.businessHours || null,
      logo: formData.profileData.image || null
    };
    
    const res = await fetch(`/api/admin/users/${userId}/provider-profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || "Failed to update provider profile");
    }
    
    return data;
  }

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      
      if (!userId) {
        throw new Error("User ID is missing");
      }
      
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user");
      }
      
      // Use your custom toast
      showToast("User deleted successfully", "success");
      
      // Refresh data
      refreshData();
    } catch (err) {
      console.error(err);
      // Use your custom toast
      showToast(err.message || "Failed to delete user", "error");
    } finally {
      setLoading(false);
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN": return "bg-red-100 text-red-800 hover:bg-red-200"
      case "PROVIDER": return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default: return "bg-green-100 text-green-800 hover:bg-green-200"
    }
  }

  return (
    <div className="space-y-4">
      {/* Include your ToastComponent here */}
      {ToastComponent}
      
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">Users Management</h1>
        <div className='flex items-center justify-center gap-4'> 
          <Button size="sm" variant="outline" onClick={refreshData}>
            <RefreshCcw className="h-4 w-4 mr-1" /> Refresh
          </Button>

          <Button size="sm" onClick={handleOpenAddUserDialog}>
            <UserPlus className="h-4 w-4 mr-1" /> Add User
          </Button>
        
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-3 pb-1 md:p-4 md:pb-1">
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-1 items-center">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-9 w-[120px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="USER">Users</SelectItem>
                  <SelectItem value="PROVIDER">Providers</SelectItem>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone Number</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead className="text-center">See More</TableHead>
                  <TableHead className="w-[80px] text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No users found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">
                          {user.role === "PROVIDER" 
                            ? user.providerProfile?.name || 'No Name'
                            : user.profile?.name || 'No Name'}
                        </div>
                        <div className="text-xs text-muted-foreground sm:hidden">{user.email}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.role === "PROVIDER" 
                          ? user.providerProfile?.phoneNumber || 'N/A'
                          : user.profile?.phoneNumber || 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-xs py-0.5 ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" onClick={() => handleViewUser(user.id)} className={`text-xs py-0.5 cursor-pointer`}>
                          <ChevronRight />
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                              <PenSquare className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
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
          <div className="flex items-center justify-between px-4 py-2 border-t">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `Showing ${users.length} ${selectedRole !== "all" ? selectedRole.toLowerCase() + "s" : "users"}`}
            </p>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog
        open={isAddingUser} 
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
          }
          setIsAddingUser(open);
        }}
      >
        <DialogContent className="max-w-md sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
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
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange(e)}
                />
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
            
            <TabsContent value="profile" className="space-y-1 pt-2">
              {/* Fields common to all roles */}
              <div className="">
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
                        placeholder="+964 0000 000 0000"
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
                        placeholder="+964 0000 000 0000"
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
          
          <DialogFooter className={"gap-2"}>
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsAddingUser(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
      );
    }
