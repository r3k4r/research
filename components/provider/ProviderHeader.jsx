'use client';

import { Bell, Menu, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ProviderHeader({ setIsSidebarOpen }) {
  const { data: session } = useSession();
  
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-6">
      {/* Mobile menu button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>
      
      {/* Provider name display */}
      <div className="hidden text-lg md:flex">
        <p className="font-medium">{session?.user?.name || 'Provider'}</p>
      </div>
      
      {/* Search */}
      <div className="flex flex-1 items-center gap-4 md:ml-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 md:w-[300px] lg:w-[400px]"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to main page</span>
          </Button>
        </Link>
        
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                2
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span>New order received</span>
                <span className="text-xs text-muted-foreground">5 minutes ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span>Product about to expire</span>
                <span className="text-xs text-muted-foreground">1 hour ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Theme toggle position would be here */}
      </div>
    </header>
  );
}
