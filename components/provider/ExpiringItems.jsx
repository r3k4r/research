'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, MoreHorizontal, AlertCircle, Trash, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { useToast } from '../ui/toast';

export function ExpiringItems() {
  const { showToast, ToastComponent } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [priceFormData, setPriceFormData] = useState({
    originalPrice: 0,
    discountedPrice: 0
  });
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: 0,
    discountedPrice: 0,
    quantity: 0,
    categoryId: '',
    expiresAt: ''
  });

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilterType(newFilter);
    fetchExpiringItems(newFilter);
  };

  // Initial data load
  useEffect(() => {
    fetchExpiringItems(filterType);
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function fetchExpiringItems(filter = filterType) {
    try {
      setLoading(true);
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`/api/provider/expiringitems?filter=${filter}&t=${timestamp}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch expiring items');
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.length} items for filter '${filter}'`);
      setItems(data);
    } catch (err) {
      console.error('Error fetching expiring items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Calculate hours until expiration
  const getHoursUntilExpiration = (expiresAt) => {
    const now = new Date();
    const expiryDate = new Date(expiresAt);
    const diffInHours = Math.round((expiryDate - now) / (1000 * 60 * 60));
    
    return diffInHours;
  };
  
  // Get urgency className based on hours remaining
  const getUrgencyClass = (hours, isExpired) => {
    if (isExpired || hours < 0) return "text-red-600";
    if (hours < 2) return "text-red-600";
    if (hours < 4) return "text-amber-600";
    return "text-green-600";
  };
  
  // Format expiry time as a readable string
  const formatExpiryTime = (expiresAt) => {
    const hours = getHoursUntilExpiration(expiresAt);
    if (hours < 0) {
      return 'Expired';
    }
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  // Handler for editing item
  const handleEditItem = (item) => {
    setSelectedItem(item);
    setEditFormData({
      name: item.name,
      description: item.description || '',
      price: item.originalPrice,
      discountedPrice: item.currentPrice,
      quantity: item.quantity,
      categoryId: item.categoryId,
      expiresAt: format(new Date(item.expiresAt), "yyyy-MM-dd'T'HH:mm")
    });
    setEditDialogOpen(true);
  };

  // Open discount dialog with item's prices
  const openDiscountDialog = (item) => {
    setSelectedItemId(item.id);
    setPriceFormData({
      originalPrice: item.originalPrice,
      discountedPrice: item.currentPrice
    });
    setDiscountDialogOpen(true);
  };

  // Submit edit form
  const handleEditSubmit = async () => {
    if (!selectedItem) return;
    
    try {
      setActionInProgress(true);
      const response = await fetch('/api/provider/expiringitems', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: selectedItem.id,
          ...editFormData,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update item');
      }

      showToast("Item updated successfully", "success");
      
      fetchExpiringItems(filterType);
    } catch (err) {
      console.error('Error updating item:', err);
      showToast(err.message || "Failed to update item", "error");
    } finally {
      setEditDialogOpen(false);
      setSelectedItem(null);
      setActionInProgress(false);
    }
  };

  // Handler for updating price
  const handleUpdatePrice = async () => {
    try {
      setActionInProgress(true);
      const response = await fetch('/api/provider/expiringitems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: selectedItemId,
          action: 'updatePrice',
          originalPrice: priceFormData.originalPrice,
          discountedPrice: priceFormData.discountedPrice
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update prices');
      }

      showToast("Prices updated successfully", "success");
      
      fetchExpiringItems(filterType);
    } catch (err) {
      console.error('Error updating prices:', err);
      showToast(err.message || "Failed to update prices", "error");
    } finally {
      setDiscountDialogOpen(false);
      setSelectedItemId(null);
      setActionInProgress(false);
    }
  };

  // Handler for marking as sold
  const handleMarkAsSold = async (itemId) => {
    try {
      setActionInProgress(true);
      const response = await fetch('/api/provider/expiringitems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          action: 'markAsSold'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark item as sold');
      }

      showToast("Item marked as sold", "success");
      
      fetchExpiringItems(filterType);
    } catch (err) {
      console.error('Error marking as sold:', err);
      showToast(err.message || "Failed to mark item as sold", "error");
    } finally {
      setActionInProgress(false);
    }
  };

  // Open delete confirmation
  const openDeleteConfirmation = (item) => {
    setItemToDelete(item);
    setDeleteAlertOpen(true);
  };

  // Handler for deleting an item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      setActionInProgress(true);
      const response = await fetch(`/api/provider/expiringitems?itemId=${itemToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete item');
      }

      showToast("Item deleted successfully", "success");
      
      fetchExpiringItems(filterType);
    } catch (err) {
      console.error('Error deleting item:', err);
      showToast(err.message || "Failed to delete item", "error");
    } finally {
      setDeleteAlertOpen(false);
      setItemToDelete(null);
      setActionInProgress(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Filter selector */}
      <div className="flex justify-end mb-4">
        <Select value={filterType} onValueChange={handleFilterChange} disabled={actionInProgress}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter items" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Delete confirmation alert */}
      {deleteAlertOpen && itemToDelete && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle className="flex items-center justify-between">
            <span>Confirm Deletion</span>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0" 
              onClick={() => setDeleteAlertOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertTitle>
          <AlertDescription>
            <p className="mb-4">Are you sure you want to delete <strong>{itemToDelete.name}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeleteAlertOpen(false)}
                disabled={actionInProgress}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDeleteItem}
                disabled={actionInProgress}
              >
                Delete
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-6 text-sm text-muted-foreground">Loading expiring items...</div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="text-center py-6 text-sm text-red-500">Error loading expiring items: {error}</div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="text-center py-6">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium">
            No items {filterType === 'expired' ? 'expired' : filterType === 'expiring-soon' ? 'expiring soon' : 'to display'}
          </h3>
          <p className="text-muted-foreground mt-1">
            {filterType === 'all' ? 'Your inventory is in good condition' : 'Try changing the filter'}
          </p>
        </div>
      )}

      {/* Items table */}
      {!loading && !error && items.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="text-center">Expires in</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const hoursLeft = getHoursUntilExpiration(item.expiresAt);
                const urgencyClass = getUrgencyClass(hoursLeft, item.isExpired);
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.id.substring(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={`flex items-center justify-center gap-1 ${urgencyClass}`}>
                        <AlertCircle className="h-4 w-4" />
                        <span>{formatExpiryTime(item.expiresAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-medium">${item.currentPrice.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground line-through">
                          ${item.originalPrice.toFixed(2)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditItem(item)}
                          disabled={actionInProgress || item.status === 'SOLD'}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit item</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              disabled={actionInProgress || item.status === 'SOLD'}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => openDiscountDialog(item)}
                              onSelect={(e) => e.preventDefault()}
                            >
                              Update prices
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleMarkAsSold(item.id)}
                              onSelect={(e) => e.preventDefault()}
                            >
                              Mark as sold
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => openDeleteConfirmation(item)}
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Remove item
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Update price dialog */}
      <Dialog 
        open={discountDialogOpen} 
        onOpenChange={(open) => {
          if (!open && !actionInProgress) {
            setTimeout(() => {
              setDiscountDialogOpen(false);
              setSelectedItemId(null);
            }, 10);
          }
        }}
      >
        <DialogContent onEscapeKeyDown={(e) => actionInProgress && e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Update Prices</DialogTitle>
            <DialogDescription>
              Set the original and discounted prices for this item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid items-center gap-2">
              <Label htmlFor="original-price">Original Price</Label>
              <Input 
                id="original-price"
                type="number" 
                min="0.01"
                step="0.01"
                value={priceFormData.originalPrice}
                onChange={e => setPriceFormData({
                  ...priceFormData, 
                  originalPrice: parseFloat(e.target.value) || 0
                })}
              />
            </div>
            <div className="grid items-center gap-2">
              <Label htmlFor="discounted-price">Discounted Price</Label>
              <Input 
                id="discounted-price"
                type="number" 
                min="0.01"
                step="0.01"
                value={priceFormData.discountedPrice}
                onChange={e => setPriceFormData({
                  ...priceFormData, 
                  discountedPrice: parseFloat(e.target.value) || 0
                })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                if (!actionInProgress) {
                  setDiscountDialogOpen(false);
                  setSelectedItemId(null);
                }
              }}
              disabled={actionInProgress}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePrice}
              disabled={
                actionInProgress || 
                priceFormData.originalPrice <= 0 || 
                priceFormData.discountedPrice <= 0 ||
                priceFormData.discountedPrice > priceFormData.originalPrice
              }
            >
              Update Prices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit item dialog */}
      <Dialog 
        open={editDialogOpen} 
        onOpenChange={(open) => {
          if (!open && !actionInProgress) {
            setTimeout(() => {
              setEditDialogOpen(false);
              setSelectedItem(null);
            }, 10);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]" onEscapeKeyDown={(e) => actionInProgress && e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update the details of your item
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                value={editFormData.price}
                onChange={(e) => setEditFormData({...editFormData, price: parseFloat(e.target.value) || 0})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discountedPrice" className="text-right">
                Discounted Price
              </Label>
              <Input
                id="discountedPrice"
                type="number"
                min="0.01"
                step="0.01"
                value={editFormData.discountedPrice}
                onChange={(e) => setEditFormData({...editFormData, discountedPrice: parseFloat(e.target.value) || 0})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={editFormData.quantity}
                onChange={(e) => setEditFormData({...editFormData, quantity: parseInt(e.target.value, 10) || 0})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiresAt" className="text-right">
                Expires At
              </Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={editFormData.expiresAt}
                onChange={(e) => setEditFormData({...editFormData, expiresAt: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                if (!actionInProgress) {
                  setEditDialogOpen(false);
                  setSelectedItem(null);
                }
              }}
              disabled={actionInProgress}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={actionInProgress}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Toast component */}
      {ToastComponent}
    </div>
  );
}
