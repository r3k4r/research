"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, User, Settings, LogOut, Menu, X, ShoppingCart } from "lucide-react"
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
import { useCart } from "@/lib/cart-context"
import { CartDrawer } from "./CartDrawer"
import { signOut, useSession } from "next-auth/react"


const Links = [
  { href: "/", label: "Home", visible: ["ADMIN", "PROVIDER", "USER"] },
  { href: "/orders", label: "Orders", visible: ["ADMIN", "PROVIDER", "USER"] },
  { href: "/providers", label: "Providers", visible: ["ADMIN", "PROVIDER", "USER"] },
  { href: "/aboutus", label: "About Us", visible: ["ADMIN", "PROVIDER", "USER"] },
  { href: "/contactus", label: "Contact Us", visible: ["ADMIN", "PROVIDER", "USER"] },
  { href: "/admin-dashboard", label: "Admin Dashboard", visible: ["ADMIN"] },
  { href: "/provider-dashboard", label: "Provider Dashboard", visible: ["PROVIDER"] },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { openCart, totalItems } = useCart()
  const { data: session, status } = useSession()
  




  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <span className="text-2xl font-bold text-primary">Second Serve</span>
              </Link>
              <div className="hidden md:block md:ml-5 lg:ml-10">
                <div className="flex items-baseline lg:space-x-4">
                  {Links.filter(link => link.visible.includes(session?.user?.role)).map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center">
              {/* Cart Button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={openCart} 
                className="mr-2 relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </Button>
              
              {/* User menu */}
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
                          width={100}
                          height={100}
                          quality={100}
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
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem className='mb-2'>
                      <Link href={session.user.role === 'PROVIDER' ? '/provider-dashboard/settings' : 'profile'} className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>  
                    <DropdownMenuItem className="bg-red-600 text-white" onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <button>Log out</button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="flex items-center md:hidden">
              {/* Mobile Cart Button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={openCart} 
                className="relative mr-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </Button>
              
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
              {Links.filter(link => link.visible.includes(session?.user?.role)).map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {session && (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center overflow-hidden ${!session.user.image ? 'bg-primary text-primary-foreground' : ''}`}>
                    {session?.user?.image ? (
                        <Image 
                          src={session?.user?.image} 
                          alt="Profile" 
                          width={100}
                          height={100}
                          quality={100}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{session?.user?.name ? session?.user?.name[0].toUpperCase() : "U"}</span>
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
                    href={session.user.role === 'PROVIDER' ? '/provider-dashboard/settings' : 'profile'}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={signOut}
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
      
      {/* Cart Drawer */}
      <CartDrawer />
    </>
  )
}