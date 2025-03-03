'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Utensils, 
  Users, 
  BarChart3,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/provider-dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Orders',
    href: '/provider-dashboard/orders',
    icon: ShoppingBag,
  },
  {
    title: 'My Products',
    href: '/provider-dashboard/products',
    icon: Utensils,
  },
  {
    title: 'Customers',
    href: '/provider-dashboard/customers',
    icon: Users,
  },
  {
    title: 'Analytics',
    href: '/provider-dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/provider-dashboard/settings',
    icon: Settings,
  },
];

export default function ProviderSidebar({ isOpen }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  console.log('session', session);
  
  
  
  return (
    <div
      className={cn(
        "sticky top-0 h-screen bg-card border-r border-border shadow-sm flex flex-col transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-14 px-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-primary">Provider Dashboard</h1>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center text-sm p-2 rounded-md transition-colors ${
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Provider Profile Section */}
        {session?.user?.role ==="PROVIDER" && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                {session?.user?.image ?  (
                  <Image 
                    src={session?.user?.image}
                    alt="Provider Logo"
                    fill
                    className="object-cover"
                  />
                )
                :
                (
                  <div className="flex items-center justify-center h-full w-full bg-gray-200 text-gray-500">
                    <User className="h-6 w-6" />
                  </div>
                )
              }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {session?.user?.name || "Provider"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.user?.email || ""}
                </p>
              </div>
            </div>
          </div>
        )}


        {
          session?.user?.role === "PROVIDER" && (
            <div className={`p-4 border-t border-gray-200 ${session?.user?.role === 'PROVIDER' ? 'block' : 'hidden'}`}>
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </Button>
            </div>
        ) }
          </div>
        </div>
  );
}
