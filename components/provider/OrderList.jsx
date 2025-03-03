import { formatDistance } from 'date-fns';
import { OrderStatusBadge } from './OrderStatusBadge';

export function OrderList({ orders, selectedOrderId, onOrderSelect }) {
  if (orders.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No orders found</p>
      </div>
    );
  }

  return (
    <div className="divide-y max-h-[600px] overflow-y-auto">
      {orders.map((order) => {
        const orderDate = new Date(order.date);
        const timeAgo = formatDistance(orderDate, new Date(), { addSuffix: true });
        
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
                <p className="font-medium">{order.id}</p>
                <p className="text-sm text-muted-foreground">{order.customerName}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex justify-between items-center mt-2 text-sm">
              <p className="text-muted-foreground">{timeAgo}</p>
              <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
