"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Briefcase, 
  Building, 
  Clock, 
  Check, 
  X, 
  Edit, 
  Trash 
} from "lucide-react"
import { useToast } from "@/components/ui/toast"

const SingleUser = ({ params }) => {
  const router = useRouter()
  const { showToast, hideToast, ToastComponent } = useToast()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
        const res = await fetch(`/api/admin-dashboard/users/${params.id}`)
        
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
    
    fetchUserData()
  }, [])

  const handleDeleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }
    
    try {
      const res = await fetch(`/api/admin-dashboard/users/${params.id}`, {
        method: "DELETE",
      })
      
      if (!res.ok) {
        throw new Error("Failed to delete user")
      }
      
      showToast("User deleted successfully", "success")
      
      setTimeout(() => {
        router.push("/admin-dashboard/users")
      }, 1500)
    } catch (error) {
      console.error(error)
      showToast("Error deleting user", "error")
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
            <Button className="mt-4" onClick={() => router.push('/admin-dashboard/users')}>
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
            onClick={() => router.push(`/admin-dashboard/users`)}
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
    </div>
  )
}

export default SingleUser