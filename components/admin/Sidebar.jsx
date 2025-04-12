"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Users, ShoppingBag, MonitorCog, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const menuItems = [
  { icon: Home, name: "Dashboard", href: "/admin-dashboard" },
  { icon: Users, name: "Users", href: "/admin-dashboard/users" },
  { icon: ShoppingBag, name: "Food", href: "/admin-dashboard/food-items" },
  { icon: MonitorCog, name: "Control-Panel", href: "/admin-dashboard/control-panel" },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsOpen(false) // Close mobile sidebar when switching to desktop
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isMobile, isOpen])

  return (
    <>
      {/* Mobile hamburger button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-3 left-3 z-50 h-8 w-8 p-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
      
      {/* Desktop sidebar with icons and labels */}
      {!isMobile && (
        <motion.div
          className="sticky top-0 h-screen bg-card border-r border-border shadow-sm flex flex-col"
          initial={{ width: 200 }}
          animate={{ width: 200 }}
          transition={{ duration: 0.2 }}
        >
          <div className="h-14 px-3 flex items-center border-b border-border">
            <span className="font-bold text-lg">Second Serve</span>
          </div>
          
          <nav className="flex-1 py-2 flex flex-col gap-1 px-3">
            {menuItems.map((item) => (
              <Link key={item.name} href={item.href} className="w-full">
                <div
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">{item.name}</span>
                </div>
              </Link>
            ))}
          </nav>
        </motion.div>
      )}
      
      {/* Mobile sidebar - overlay with full menu */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              className="fixed left-0 top-0 h-full z-50 bg-background border-r border-border w-[70%] max-w-[250px]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h1 className="font-bold text-lg">Second Serve</h1>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <nav className="p-2">
                {menuItems.map((item) => (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <div
                      className={`flex items-center px-3 py-2 my-1 rounded-md ${
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

