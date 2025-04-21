import { Badge } from '@/components/ui/badge';

export function OrderStatusBadge({ status, size = "default" }) {
  const getBadgeColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800';
      case 'PREPARING':
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100 hover:text-indigo-800';
      case 'READY_FOR_PICKUP':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100 hover:text-purple-800';
      case 'IN_TRANSIT':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100 hover:text-amber-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800';
    }
  };
  
  const formatStatus = (status) => {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const sizeClasses = size === "sm" 
    ? "text-xs py-0 px-2" 
    : "py-1 px-2";

  return (
    <Badge variant="outline" className={`${getBadgeColor(status)} ${sizeClasses} font-medium`}>
      {formatStatus(status)}
    </Badge>
  );
}
