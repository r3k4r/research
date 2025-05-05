import { Badge } from '@/components/ui/badge';

export function OrderStatusBadge({ status }) {
  switch (status) {
    case 'PENDING':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    case 'ACCEPTED':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Accepted</Badge>;
    case 'PREPARING':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Preparing</Badge>;
    case 'READY_FOR_PICKUP':
      return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Ready</Badge>;
    case 'IN_TRANSIT':
      return <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">In Transit</Badge>;
    case 'DELIVERED':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
    case 'CANCELLED':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status || 'Unknown'}</Badge>;
  }
}
