import { formatDistance } from 'date-fns';
import { OrderStatusBadge } from './OrderStatusBadge';

export function OrderList({ orders, selectedOrderId, onOrderSelect, loading }) {
  const formatTimeAgo = (dateString) => {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  };
  
  if (loading) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        Loading orders...
      </div>
    );
  }
  
  if (orders.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {orders.map((order) => (
        <div
          key={order.id}
          className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
            selectedOrderId === order.id ? 'bg-accent' : ''
          }`}
          onClick={() => onOrderSelect(order)}
        >
          <div className="flex justify-between items-start mb-1">
            <div className="font-medium">{order.customerName}</div>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="text-muted-foreground">#{order.id.substring(0, 8).toUpperCase()}</div>
            <div className="text-muted-foreground">{formatTimeAgo(order.date)}</div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm">
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
            </div>
            <div className="text-sm font-medium">{order.totalAmount.toFixed(2)} IQD</div>
          </div>
        </div>
      ))}
    </div>
  );
}
