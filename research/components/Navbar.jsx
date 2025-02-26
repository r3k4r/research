"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, User, Settings, LogOut, Menu, X } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import Image from "next/image"

const Links = [
  { href: "/", label: "Home", visible: "ADMIN, PROVIDER, USER"},
  { href: "/providers", label: "Providers", visible: "ADMIN, PROVIDER, USER" },
  { href: "/aboutus", label: "About Us", visible: "ADMIN, PROVIDER, USER" },
  { href: "/how-it-works", label: "How it works", visible: "ADMIN, PROVIDER, USER" },
  { href: "/Admin Dashboard", label: "Admin-Dashboard", visible: "ADMIN" },
  { href: "/Provider-Dashboard", label: "Provider Dashboard", visible: "PROVIDER" },
]

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  if (status === "loading" || (status === "authenticated" && !session)) {
    return <nav className="animate-pulse bg-gray-400 shadow-md">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
        </div>
      </div>
    </nav>
  }
  
  

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (data.results) {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      }
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const handleLogout = async () => {

    await signOut()
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-primary">Second Serve</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                 {Links.map((link)=>{
                  return (
                    <Link
                      href={link.href}
                      className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {link.label}
                    </Link>
                  )
                 }

                 )}
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
            <form onSubmit={handleSearch} className="max-w-lg w-full lg:max-w-xs">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </form>
          </div>
          <div className="hidden md:block">
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
          <div className="-mr-2 flex md:hidden">
            <Button
              variant="ghost"
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </Link>
            <Link
              href="/providers"
              className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
            >
              Providers
            </Link>
          </div>
          {session && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center overflow-hidden ${!session.user.image ? 'bg-primary text-primary-foreground' : ''}`}>
                    {session.user.image ? (
                      <img 
                        src={session.user.image} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{session.user.name ? session.user.name[0].toUpperCase() : "U"}</span>
                    )}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{session?.user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{session?.user.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-600 text-white"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

