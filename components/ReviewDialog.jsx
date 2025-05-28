import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ReviewDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  foodItem,
  orderId,
  isSubmitting = false
}) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(null);
  const [reviewType, setReviewType] = useState('ITEM');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');



  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setHoveredRating(null);
      setReviewType('ITEM');
      setComment('');
      setError('');
    }
  }, [isOpen, foodItem]);

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleRatingHover = (value) => {
    setHoveredRating(value);
  };

  const handleRatingLeave = () => {
    setHoveredRating(null);
  };

  const handleSubmit = () => {
    if (!reviewType) {
      setError('Please select a review type');
      return;
    }

    
    let actualFoodItemId = null;
    
    if (foodItem) {
      actualFoodItemId = foodItem.foodItemId || foodItem.id;
      
    }
    
    if (!actualFoodItemId) {
      console.error("Missing foodItemId in foodItem object:", foodItem);
      setError('Unable to identify the food item to review');
      return;
    }

    onSubmit({
      foodItemId: actualFoodItemId,
      orderId,
      rating,
      type: reviewType,
      comment
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Review Your Order</DialogTitle>
          <DialogDescription>
            Share your feedback about {foodItem?.name || 'this item'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="review-type">What would you like to review?</Label>
            <Select
              value={reviewType}
              onValueChange={setReviewType}
              disabled={isSubmitting}
            >
              <SelectTrigger id="review-type">
                <SelectValue placeholder="Select what you want to review" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Review Type</SelectLabel>
                  <SelectItem value="ITEM">Food Quality</SelectItem>
                  <SelectItem value="DELIVERY">Delivery Service</SelectItem>
                  <SelectItem value="PREPARING">Food Preparation</SelectItem>
                  <SelectItem value="OTHERS">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label>Your Rating</Label>
            <div 
              className="flex items-center gap-1"
              onMouseLeave={handleRatingLeave}
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const displayValue = hoveredRating !== null ? hoveredRating : rating;
                const isFilled = value <= displayValue;
                const isHalfFilled = value === Math.ceil(displayValue) && displayValue % 1 !== 0;
                
                return (
                  <div 
                    key={value}
                    className="cursor-pointer relative h-8 w-8"
                    onClick={() => handleRatingClick(value)}
                    onMouseEnter={() => handleRatingHover(value)}
                  >
                    <Star 
                      className={`h-8 w-8 transition-colors ${
                        isFilled 
                          ? "text-yellow-400 fill-yellow-400" 
                          : "text-muted-foreground"
                      }`}
                    />
                    
                    {isHalfFilled && (
                      <div className="absolute inset-0 overflow-hidden w-[50%]">
                        <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                      </div>
                    )}
                  </div>
                );
              })}
              <span className="ml-2 text-lg font-medium">{rating}/5</span>
            </div>
            
            {/* Half-star rating option */}
            <div className="flex items-center gap-2 pt-2">
              <div className="flex gap-1">
                {[0.5, 1.5, 2.5, 3.5, 4.5].map((value) => (
                  <Button 
                    key={value} 
                    type="button"
                    size="sm"
                    variant={rating === value ? "default" : "outline"}
                    className="h-7 px-2 text-xs"
                    onClick={() => handleRatingClick(value)}
                    disabled={isSubmitting}
                  >
                    {value}
                  </Button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">Half-star options</span>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="comment">Your Comments (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
