import Image from "next/image";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Clock, 
  Store, 
  ShoppingBag, 
  DollarSign,
  Utensils
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const PurchasedItem = ({ item, orderDetails }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!item) return null;

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <div className="relative w-full h-48">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <Utensils className="h-12 w-12 text-muted-foreground opacity-50" />
            <span className="sr-only">No image available</span>
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{item.name}</CardTitle>
          <Badge variant="secondary" className="text-xs px-2 py-0.5 mt-0.5">
            Quantity: {item.quantity}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {item.description && (
          <p className="text-sm text-muted-foreground">
            {item.description}
          </p>
        )}

        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {formatCurrency(item.price)} {item.quantity > 1 && `(${formatCurrency(item.price / item.quantity)} each)`}
          </span>
        </div>

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Purchased: {formatDate(orderDetails.createdAt)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            <span>Order ID: {orderDetails.id.substring(0, 8)}...</span>
          </div>

          {orderDetails.paymentMethod && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Payment: {orderDetails.paymentMethod.toUpperCase()}</span>
            </div>
          )}

          {orderDetails.status && (
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span>Status: {orderDetails.status.replace(/_/g, ' ')}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-muted/40 py-3 px-6">
        <div className="flex justify-between w-full text-sm">
          <span className="text-muted-foreground">Total for item:</span>
          <span className="font-semibold">
            {formatCurrency(item.price)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PurchasedItem;