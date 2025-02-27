"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Users, ShoppingBag, BarChart2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

const menuItems = [
  { icon: Home, name: "Dashboard", href: "/admin-dashboard" },
  { icon: Users, name: "Users", href: "/admin-dashboard/users" },
  { icon: ShoppingBag, name: "Food Items", href: "/admin-dashboard/food-items" },
  { icon: BarChart2, name: "Analytics", href: "/admin-dashboard/analytics" },
  { icon: Settings, name: "Settings", href: "/admin-dashboard/settings" },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()

  return (
    <motion.div
      className="bg-card text-card-foreground border-r"
      initial={{ width: isOpen ? 240 : 80 }}
      animate={{ width: isOpen ? 240 : 80 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <h1 className={`text-2xl font-bold ${isOpen ? "block" : "hidden"}`}>Second Serve</h1>
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} className="mt-4">
          {isOpen ? "<<" : ">>"}
        </Button>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <motion.div
              className={`flex items-center px-4 py-3 ${
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className="h-6 w-6" />
              {isOpen && <span className="ml-4">{item.name}</span>}
            </motion.div>
          </Link>
        ))}
      </nav>
    </motion.div>
  )
}

