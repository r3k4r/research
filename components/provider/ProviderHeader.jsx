'use client';

import { Bell, Menu, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useNotifications } from '@/components/NotificationContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getValidDate, formatRelativeTime } from '@/utils/dateFormatters';

export default function ProviderHeader({ setIsSidebarOpen }) {
  const { data: session } = useSession();
  const { notifications, unreadCount, markAsViewed, markAllAsViewed } = useNotifications();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUpdated, setTimeUpdated] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setTimeUpdated(prev => prev + 1);
    }, 15000);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleNotificationClick = (notification) => {
    markAsViewed(notification.id);
    router.push('/provider-dashboard/orders');
  };
  
  return (
    <header className="sticky  z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-6">
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
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={markAllAsViewed}
                >
                  <Check className="h-3 w-3 mr-1" /> Mark all as viewed
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => {
                  const notifDate = getValidDate(notification);
                  const timeAgo = formatRelativeTime(notifDate, currentTime);
                  
                  return (
                    <DropdownMenuItem 
                      key={notification.id}
                      className={`flex flex-col items-start py-3 cursor-pointer ${!notification.viewed ? 'bg-accent/40' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex flex-col w-full">
                        <span className="font-medium">
                          {notification.title}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {notification.message}
                        </span>
                        <span 
                          className="text-xs text-muted-foreground mt-1" 
                          key={`time-${notification.id}-${timeUpdated}`}
                        >
                          {timeAgo}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  );
                })
              )}
            </div>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center text-center"
              asChild
            >
              <Link href="/provider-dashboard/notifications">View all notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
