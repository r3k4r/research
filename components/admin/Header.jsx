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
import Link from "next/link"

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
        <div className="flex items-center gap-1">
              <Link href="/">
                <Button size="sm">
                    Back to Main Page
                </Button>
              </Link>
        </div>
      </div>
    </header>
  )
}

