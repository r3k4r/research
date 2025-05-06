'use client';

import { useState } from 'react';
import { useNotifications } from '@/components/NotificationContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, RefreshCw, Check } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsViewed, markAllAsViewed, fetchNotifications } = useNotifications();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setLoading(true);
    await fetchNotifications();
    setLoading(false);
  };

  const handleNotificationClick = async (notification) => {
    await markAsViewed(notification.id);
    router.push('/provider-dashboard/orders');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsViewed}>
              <Check className="mr-2 h-4 w-4" /> Mark all as viewed
            </Button>
          )}
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
            Refresh
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Your Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No notifications to display</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    !notification.viewed ? 'bg-accent/40' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.viewed && (
                        <Badge variant="default" className="ml-2">New</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { 
                        addSuffix: true,
                        includeSeconds: true
                      })}
                    </span>
                  </div>
                  <p>{notification.message}</p>
                  {notification.data && notification.data.status && (
                    <Badge 
                      variant="outline" 
                      className="mt-2"
                      style={{
                        backgroundColor: 
                          notification.data.status === 'PENDING' ? 'var(--warning)' : 
                          notification.data.status === 'COMPLETED' ? 'var(--success)' : 
                          notification.data.status === 'CANCELLED' ? 'var(--destructive)' : 
                          'var(--muted)'
                      }}
                    >
                      {notification.data.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
