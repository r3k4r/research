"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "USER" })

  useEffect(() => {
    // Fetch users from API
    // For now, we'll use mock data
    setUsers([
      { id: 1, name: "John Doe", email: "john@example.com", role: "USER" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", role: "PROVIDER" },
      // Add more mock users...
    ])
  }, [])

  const handleAddUser = () => {
    // In a real application, you would make an API call here
    setUsers([...users, { id: Date.now(), ...newUser }])
    setNewUser({ name: "", email: "", role: "USER" })
  }

  const handleDeleteUser = (id) => {
    // In a real application, you would make an API call here
    setUsers(users.filter((user) => user.id !== id))
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Users Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <Input
              placeholder="Search users..."
              className="max-w-sm"
              // Implement search functionality
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add New User</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    placeholder="Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                  <Input
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="USER">User</option>
                    <option value="PROVIDER">Provider</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button variant="outline" className="mr-2">
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

