import { formatDistance } from 'date-fns';
import { OrderStatusBadge } from './OrderStatusBadge';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OrderList({ orders, selectedOrderId, onOrderSelect, loading, error }) {
  const formatTimeAgo = (dateString) => {
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Unknown time";
    }
  };
  
  if (loading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-amber-500 mb-2" />
          <p className="text-muted-foreground mb-4">Error loading orders</p>
          <p className="text-xs text-red-500 mt-1 mb-4">{error}</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            Try Again
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
        const orderDate = new Date(order.date);
        const timeAgo = formatTimeAgo(order.date);
        
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
              <p className="text-muted-foreground">{timeAgo}</p>
              <p className="font-medium">{order.totalAmount.toFixed(2)} IQD</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
