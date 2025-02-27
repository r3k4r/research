"use client"

import { Bell, LogOut, Settings, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { Input } from "@/components/ui/input"

export default function Header() {
  const { data: session, status } = useSession()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-30 w-full h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center">
      <div className="container flex items-center justify-between h-full px-2 md:px-4">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold ml-10 md:ml-0">Admin</h2>
        </div>
        
        <div className="hidden md:flex relative max-w-md w-full mx-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8 h-9"
          />
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-600" />
          </Button>

          {status === "authenticated" && session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 px-1">
                  {session?.user?.image ? (
                    <Image 
                      src={session.user.image} 
                      alt="Profile"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-foreground">
                        {session?.user?.name?.[0].toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:inline text-sm">
                    {session?.user?.name?.split(' ')[0] || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 text-sm">
                  <p className="font-medium">{session?.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{session?.user.email || ""}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}

