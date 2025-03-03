'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Utensils, 
  Users, 
  BarChart3,
  Settings,
  LogOut,
  User,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';

// Navigation items with Profile added to the list
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
    title: 'Profile',
    href: '/provider-dashboard/profile',
    icon: User,
  },
  {
    title: 'Settings',
    href: '/provider-dashboard/settings',
    icon: Settings,
  },
];

export default function ProviderSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
      : 'P';
  };
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-card shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar header */}
        <div className="flex h-14 items-center justify-between border-b px-3">
          <Link href="/provider-dashboard" className="flex items-center">
            <h1 className="text-lg font-bold text-foreground">Provider Portal</h1>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(false)} 
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Navigation menu */}
        <div className="flex-1 py-4 px-3">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Profile & logout section at bottom */}
        <div className="border-t p-4">
          <div className="mb-4 flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={session?.user?.image} />
              <AvatarFallback>{getInitials(session?.user?.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{session?.user?.name || 'Provider Name'}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.email || 'provider@example.com'}</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}
