"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, User, Settings, LogOut, Menu, X, ShoppingCart, History } from "lucide-react"
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
import Language from "./Language"
import ThemeToggle from "./ThemeToggle"

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
  const menuRef = useRef(null)
  const menuButtonRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the menu button itself
      if (menuButtonRef.current && menuButtonRef.current.contains(event.target)) {
        return;
      }
      
      // Close if clicking outside the menu
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      // Use a slight delay to avoid immediate execution
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 10);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      }
    }
  }, [isMenuOpen])

  // Handle link click to close menu
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  }

  // Modified toggle function to prevent event bubbling issues
  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsMenuOpen(prev => !prev);
  };

  return (
    <>
      <nav className="bg-white shadow-md dark:bg-dark10 dark:border-[1px] dark:border-b-gray-500/40 dark:shadow-gray-600">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <span className="md:hidden lg:block  text-xl xl:text-2xl font-bold text-primary">Second Serve</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center lg:space-x-4">
                {Links.filter(link => link.visible.includes(session?.user?.role)).map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="text-gray-700 hover:text-black dark:text-white dark:hover:text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Language />
              <div className="hidden md:flex items-center ml-4">
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
                        <Link href={session.user.role === 'PROVIDER' ? '/provider-dashboard/settings' : '/profile'} className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>  
                      <DropdownMenuItem className='mb-2'>
                        <Link href={'/orderhistory'} className="flex items-center">
                          <History className="mr-2 h-4 w-4" />
                          <span>Order History</span>
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
                  ref={menuButtonRef}
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
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden" ref={menuRef}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {Links.filter(link => link.visible.includes(session?.user?.role)).map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-primary dark:text-white dark:bg-dark20 dark:hover:bg-dark20/70 block px-3 py-2 rounded-md text-base font-medium"
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
                <div className="mt-3 px-2 space-y-2">
                  <Link
                    href={session.user.role === 'PROVIDER' ? '/provider-dashboard/settings' : '/profile'}
                    onClick={handleLinkClick}
                    className="block px-3 py-2 rounded-md text-base font-medium  text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-primary dark:text-white dark:bg-dark20 dark:hover:bg-dark20/70"
                  >
                    Profile
                  </Link>

                  <Link 
                    href={'/orderhistory'} 
                    className="block px-3 py-2 rounded-md text-base font-medium  text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-primary dark:text-white dark:bg-dark20 dark:hover:bg-dark20/70"
                    >
                      <span>Order History</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut();
                    }}
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