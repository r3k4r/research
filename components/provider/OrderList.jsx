import { formatDistance } from 'date-fns';
import { OrderStatusBadge } from './OrderStatusBadge';
import { AlertTriangle } from 'lucide-react';

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
      <div className="py-4 text-center text-muted-foreground">
        Loading orders...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-amber-500 mb-2" />
          <p className="text-muted-foreground">Error loading orders</p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
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
      {orders.map((order) => {
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
