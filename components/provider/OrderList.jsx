import { OrderStatusBadge } from './OrderStatusBadge';
import { AlertTriangle, Loader2, RefreshCw, DatabaseIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { getValidDate, formatRelativeTime } from '@/utils/dateFormatters';

export function OrderList({ orders, selectedOrderId, onOrderSelect, loading, error }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUpdated, setTimeUpdated] = useState(0);

  useEffect(() => {
    // Update more frequently (every 15 seconds) for accurate timestamps
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setTimeUpdated(prev => prev + 1); // Force component to re-render
    }, 15000);
    
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }
  
  if (error) {
    // Enhanced error display with better information and actions
    return (
      <div className="py-8 flex flex-col items-center justify-center px-4">
        <AlertTriangle className="h-10 w-10 text-amber-500 mb-2" />
        <h3 className="font-medium text-lg mb-1">Unable to load orders</h3>
        
        <Alert variant="destructive" className="my-4 max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="text-sm mb-2">
              {error.includes("not found in enum") ? (
                <span>
                  There's a schema mismatch. Please run <code className="bg-red-100 px-1 rounded text-red-800">npx prisma db push</code> to update your database schema.
                </span>
              ) : error}
            </div>
            
            <div className="text-xs mt-3 text-red-300">
              If this error persists, please contact the administrator.
            </div>
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh Page
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              const url = window.location.origin;
              window.open(`${url}/provider-dashboard`, '_self');
            }}
            className="flex items-center"
          >
            <DatabaseIcon className="h-3.5 w-3.5 mr-1" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  if (!orders || orders.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <div className="divide-y max-h-[600px] overflow-y-auto">
      {Array.isArray(orders) && orders.map((order) => {
        // Use the consistent date handler
        const orderDate = getValidDate(order);
        const timeAgo = formatRelativeTime(orderDate, currentTime);
        
        
        return (
          <div
            key={order.id}
            onClick={() => onOrderSelect(order)}
            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
              selectedOrderId === order.id ? 'bg-muted' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{order.id.substring(0, 8).toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">{order.customerName}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex justify-between items-center mt-2 text-sm">
              <p 
                className="text-muted-foreground" 
                key={`time-${order.id}-${timeUpdated}`} // Key ensures re-render
              >
                {timeAgo}
              </p>
              <p className="font-medium">{order.totalAmount.toFixed(2)} IQD</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
