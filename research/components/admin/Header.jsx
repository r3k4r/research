"use client"
import { Bell, LogOut, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"

export default function Header() {
    const { data: session, status } = useSession()
  

    const handleLogout = async () => {

      await signOut()
    }

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-4">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="ml-4 flex items-center md:ml-6">
              {status === "authenticated" && session?.user && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="relative rounded-full bg-primary text-primary-foreground h-8 w-8 p-0 overflow-hidden"
                        >
                          <span className="sr-only">Open user menu</span>
                          {session?.user?.image ? (
                            <Image 
                              src={session?.user?.image} 
                              alt="Profile" 
                              width={32}
                              height={32}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>{session?.user?.name ? session?.user?.name[0].toUpperCase() : "U"}</span>
                          )}
                        </Button>
                        </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-4 py-3">
                        <p className="text-sm">Signed in as</p>
                        <p className="text-sm font-medium truncate">{session?.user.name}</p>
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
                      <DropdownMenuItem className="bg-red-600 text-white" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <button >Log out</button >
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              )}
            </div>
          </div>
          </div>
        </div>
    </header>
  )
}

