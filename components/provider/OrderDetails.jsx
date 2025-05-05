import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from './OrderStatusBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Clock, MapPin, Phone, User, ArrowLeft } from 'lucide-react';

export function OrderDetails({ order, onStatusUpdate }) {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [actionType, setActionType] = useState('update'); // 'update' or 'go-back'
  const [statusNote, setStatusNote] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('30');
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const getNextStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'PENDING':
        return ['ACCEPTED', 'CANCELLED'];
      case 'ACCEPTED':
        return ['PREPARING', 'CANCELLED'];
      case 'PREPARING':
        return ['READY_FOR_PICKUP', 'CANCELLED'];
      case 'READY_FOR_PICKUP':
        return ['IN_TRANSIT', 'CANCELLED'];
      case 'IN_TRANSIT':
        return ['DELIVERED', 'CANCELLED'];
      case 'DELIVERED':
        return ['CANCELLED']; // Can cancel even after delivery
      case 'CANCELLED':
        return ['PENDING', 'ACCEPTED']; // Can restore cancelled orders
      default:
        return [];
    }
  };
  
  const handleStatusUpdateClick = (status) => {
    setSelectedStatus(status);
    setActionType('update');
    setIsUpdateDialogOpen(true);
  };
  
  const handleGoBackClick = () => {
    setActionType('go-back');
    setIsUpdateDialogOpen(true);
  };
  
  const confirmStatusUpdate = () => {
    if (actionType === 'update') {
      if (selectedStatus === 'ACCEPTED') {
        onStatusUpdate(order.id, selectedStatus, statusNote, 'update', estimatedMinutes);
      } else {
        onStatusUpdate(order.id, selectedStatus, statusNote);
      }
    } else {
      onStatusUpdate(order.id, null, statusNote, 'go-back');
    }
    setStatusNote('');
    setIsUpdateDialogOpen(false);
  };
  
  const cancelStatusUpdate = () => {
    setSelectedStatus('');
    setStatusNote('');
    setIsUpdateDialogOpen(false);
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'Accept Order';
      case 'PREPARING': return 'Start Preparation';
      case 'READY_FOR_PICKUP': return 'Ready for Pickup';
      case 'IN_TRANSIT': return 'Start Delivery';
      case 'DELIVERED': return 'Mark Delivered';
      case 'CANCELLED': return 'Cancel Order';
      case 'PENDING': return 'Mark Pending';
      default: return status;
    }
  };
  
  const getStatusButtonVariant = (status) => {
    if (status === 'CANCELLED') return 'destructive';
    if (status === 'ACCEPTED') return 'success';
    return 'default';
  };
  
  // Function to determine if Go Back button should be shown - now show for all statuses
  const canGoBack = () => {
    // Show Go Back for all statuses that have history
    return order.statusLogs && order.statusLogs.length > 1;
  };
  
  if (!order) return null;
  
  const nextStatuses = getNextStatuses(order.status);

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">#{order.id.substring(0, 8).toUpperCase()}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Placed on {formatDate(order.date)}
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </CardHeader>
        
        <CardContent className="flex-grow overflow-auto">
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="space-y-2">
              <h3 className="font-medium">Customer Information</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{order.address}</span>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="space-y-2">
              <h3 className="font-medium">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm py-1 border-b">
                    <div>
                      <span className="font-medium">{item.quantity}x </span>
                      <span>{item.name}</span>
                    </div>
                    <span>{(item.price * item.quantity).toFixed(2)} IQD</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="space-y-2">
              <h3 className="font-medium">Order Summary</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{order.subtotal.toFixed(2)} IQD</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>{order.deliveryFee.toFixed(2)} IQD</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee:</span>
                  <span>{order.serviceFee.toFixed(2)} IQD</span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t">
                  <span>Total:</span>
                  <span>{order.totalAmount.toFixed(2)} IQD</span>
                </div>
              </div>
            </div>
            
            {/* Estimated delivery time */}
            {order.estimatedDelivery && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-2">
                <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-700">Estimated Delivery Time</p>
                  <p className="text-sm text-blue-600">
                    {order.estimatedMinutes > 0 
                      ? `Approximately ${order.estimatedMinutes} minutes remaining` 
                      : `Expected delivery time: ${formatDate(order.estimatedDelivery)}`}
                  </p>
                </div>
              </div>
            )}
            
            {order.status === 'CANCELLED' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700">Order Cancelled</p>
                  <p className="text-sm text-red-600">This order has been cancelled.</p>
                  {order.statusLogs && order.statusLogs.length > 0 && order.statusLogs[0].notes && (
                    <p className="text-sm text-red-600 mt-1">Reason: {order.statusLogs[0].notes}</p>
                  )}
                </div>
              </div>
            )}
            
            {order.status === 'DELIVERED' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start gap-2">
                <Clock className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-700">Order Completed</p>
                  <p className="text-sm text-green-600">This order has been delivered successfully.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex flex-wrap gap-2">
          {/* Go Back button - now available for any status with history */}
          {canGoBack() && (
            <Button
              variant="outline"
              onClick={handleGoBackClick}
              className="flex items-center mr-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
          
          {/* Next status buttons */}
          {nextStatuses.length > 0 && nextStatuses.map((status) => (
            <Button
              key={status}
              onClick={() => handleStatusUpdateClick(status)}
              variant={getStatusButtonVariant(status)}
            >
              {getStatusText(status)}
            </Button>
          ))}
        </CardFooter>
      </Card>
      
      {/* Status Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'go-back'
                ? 'Revert Order Status'
                : selectedStatus === 'CANCELLED'
                  ? 'Cancel Order'
                  : `Update Order to ${selectedStatus.replace('_', ' ')}`}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'go-back'
                ? 'This will revert the order to its previous status.'
                : selectedStatus === 'CANCELLED'
                  ? 'Are you sure you want to cancel this order? This action cannot be undone.'
                  : `Change the status of order #${order?.id.substring(0, 8).toUpperCase()} to ${selectedStatus.replace('_', ' ')}.`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* For ACCEPTED status, show estimated delivery time input */}
            {selectedStatus === 'ACCEPTED' && (
              <div className="space-y-2">
                <Label htmlFor="estimatedMinutes">Estimated Delivery Time (minutes)</Label>
                <Input
                  id="estimatedMinutes"
                  type="number"
                  min="1"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter how many minutes it will take to prepare and deliver this order
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Add notes (optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this status change..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={cancelStatusUpdate}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'go-back' ? 'secondary' : selectedStatus === 'CANCELLED' ? 'destructive' : 'default'}
              onClick={confirmStatusUpdate}
            >
              {actionType === 'go-back' 
                ? 'Revert Status' 
                : selectedStatus === 'CANCELLED' 
                  ? 'Yes, Cancel Order' 
                  : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}