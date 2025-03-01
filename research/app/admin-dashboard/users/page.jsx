"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus, Trash2, PenSquare, MoreVertical, Filter, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "USER" })
  const [isAddingUser, setIsAddingUser] = useState(false)
  
  useEffect(() => {
    async function fetchUsers(){
      try{
        const res = await fetch('/api/admin-dashboard/users');
        const data = await res.json();
        console.log('data', data.users);
        
        if (data.users) {
          const mappedUsers = data.users.map(user => ({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.role === "PROVIDER" 
            ? user.providerProfile?.name || 'No Name'
            : user.profile?.name || 'No Name',
            phoneNumber: user.role === "PROVIDER" 
              ? user.providerProfile?.phoneNumber || 'N/A'
              : user.profile?.phoneNumber || 'N/A'
          }));
          setUsers(mappedUsers);
        }
      } catch(err) {
        console.log(err);
      }
    }

    fetchUsers();
  }, [])

  const handleAddUser = () => {
    setUsers([...users, { id: Date.now().toString(), ...newUser, phoneNumber: "N/A" }])
    setNewUser({ name: "", email: "", role: "USER" })
    setIsAddingUser(false)
  }

  const handleDeleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id))
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN": return "bg-red-100 text-red-800 hover:bg-red-200"
      case "PROVIDER": return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default: return "bg-green-100 text-green-800 hover:bg-green-200"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">Users Management</h1>
        <Button size="sm" onClick={() => setIsAddingUser(true)}>
          <UserPlus className="h-4 w-4 mr-1" /> Add User
        </Button>
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
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-3.5 w-3.5 mr-1" /> Filter
              </Button>
              <Select defaultValue="all">
                <SelectTrigger className="h-9 w-[120px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="provider">Providers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
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
                  <TableHead className="w-[80px] text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No users found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">{user.email}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.phoneNumber}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-xs py-0.5 ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
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
                            <DropdownMenuItem>
                              <PenSquare className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-green-600 focus:text-green-600"
                            >
                              <Shield className="mr-2 h-4 w-4" /> Promot to admin
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
              Showing {filteredUsers.length} of {users.length} users
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">Full Name</label>
              <Input
                id="name"
                placeholder="John Doe"
                value={newUser?.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={newUser?.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="role" className="text-sm font-medium">Role</label>
              <Select
                id="role"
                value={newUser?.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="PROVIDER">Provider</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingUser(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

