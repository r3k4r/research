'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stockLimits, setStockLimits] = useState({});
  const isMountedRef = useRef(true);
  const isInitialLoadDoneRef = useRef(false);
  const stockLimitsRef = useRef({});
  
  // Load cart from localStorage on client side - with protection against memory leaks
  useEffect(() => {
    setIsLoading(true);
    
    // Mark component as mounted
    isMountedRef.current = true;
    
    try {
      // Only load cart on client side
      if (typeof window !== 'undefined' && !isInitialLoadDoneRef.current) {
        const storedCart = localStorage.getItem('cart');
        const storedStockLimits = localStorage.getItem('stockLimits');
        
        if (storedCart && isMountedRef.current) {
          try {
            const parsedCart = JSON.parse(storedCart);
            if (Array.isArray(parsedCart)) {
              setItems(parsedCart);
            } else {
              console.warn('Cart data is not an array, resetting cart');
              setItems([]);
            }
          } catch (parseError) {
            console.error('Failed to parse cart from localStorage:', parseError);
            setItems([]);
          }
        }
        
        // Load stock limits
        if (storedStockLimits && isMountedRef.current) {
          try {
            const parsedLimits = JSON.parse(storedStockLimits);
            setStockLimits(parsedLimits || {});
            stockLimitsRef.current = parsedLimits || {};
          } catch (parseError) {
            console.error('Failed to parse stock limits from localStorage:', parseError);
            setStockLimits({});
            stockLimitsRef.current = {};
          }
        }
        
        isInitialLoadDoneRef.current = true;
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      if (isMountedRef.current) {
        setItems([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Save cart to localStorage when it changes, with debounce
  useEffect(() => {
    if (!isLoading && isMountedRef.current) {
      const saveToStorage = () => {
        if (items.length > 0) {
          localStorage.setItem('cart', JSON.stringify(items));
        } else {
          localStorage.removeItem('cart');
        }
        
        // Also save current stock limits
        const currentStockLimits = stockLimitsRef.current;
        if (Object.keys(currentStockLimits).length > 0) {
          localStorage.setItem('stockLimits', JSON.stringify(currentStockLimits));
        } else {
          localStorage.removeItem('stockLimits');
        }
      };
      
      // Small timeout to prevent excessive writes during rapid updates
      const timeoutId = setTimeout(saveToStorage, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [items, isLoading]);

  // Update stock limit for a specific item - using refs to avoid state loops
  const updateStockLimit = (itemId, maxQuantity) => {
    if (!itemId || maxQuantity === undefined) return;
    
    // Update stock limits in ref immediately
    stockLimitsRef.current = {
      ...stockLimitsRef.current,
      [itemId]: maxQuantity
    };
    
    // Update state less frequently
    setStockLimits(stockLimitsRef.current);
  };

  const addItem = (item) => {
    if (!item.id || !item.name || !item.price) {
      console.error("Cannot add invalid item to cart", item);
      return;
    }
    
    // Default max quantity to a large number if not provided
    // Use ref for instant access to latest stock limits
    const maxStock = (stockLimitsRef.current[item.id] !== undefined) 
      ? stockLimitsRef.current[item.id] 
      : (item.quantity !== undefined ? item.quantity : 999);
    
    // Record stock limit for future reference if not already set
    if (item.quantity !== undefined && stockLimitsRef.current[item.id] === undefined) {
      stockLimitsRef.current = {
        ...stockLimitsRef.current,
        [item.id]: item.quantity
      };
      // Update state less frequently - this prevents infinite loops
      setStockLimits(stockLimitsRef.current);
    }
    
    setItems(prevItems => {
      // Ensure prevItems is an array
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      
      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Check if we're already at max quantity
        const currentQuantity = currentItems[existingItemIndex].quantity || 1;
        if (currentQuantity >= maxStock) {
          // Can't add more of this item
          if (isOpen === false) {
            setIsOpen(true); // Open the cart to show the item is at max quantity
          }
          return currentItems;
        }
        
        // Update quantity if item exists and below max
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: Math.min(maxStock, (updatedItems[existingItemIndex].quantity || 1) + 1)
        };
        return updatedItems;
      } else {
        // Add new item with quantity 1
        return [...currentItems, { 
          ...item, 
          quantity: 1,
          providerId: item.providerId || null,
          provider: item.provider || 'Unknown',
          image: item.image || '/default-food.jpg'
        }];
      }
    });
  };

  const removeItem = (itemId) => {
    setItems(prevItems => {
      // Ensure prevItems is an array
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      return currentItems.filter(item => item.id !== itemId);
    });
  };

  const updateItemQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    
    const maxStock = stockLimitsRef.current[itemId] !== undefined ? stockLimitsRef.current[itemId] : 999;
    
    // Ensure quantity doesn't exceed stock limit
    const safeQuantity = Math.min(quantity, maxStock);
    
    setItems(prevItems => {
      // Ensure prevItems is an array
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      return currentItems.map(item => 
        item.id === itemId ? { ...item, quantity: safeQuantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
      localStorage.removeItem('stockLimits');
    }
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  
  // Get remaining stock for an item
  const getRemainingStock = (itemId) => {
    if (!itemId || stockLimitsRef.current[itemId] === undefined) return null;
    
    const item = items.find(item => item.id === itemId);
    const currentQuantity = item ? (item.quantity || 0) : 0;
    return stockLimitsRef.current[itemId] - currentQuantity;
  };
  
  // Check if item is at max quantity
  const isAtMaxQuantity = (itemId) => {
    if (!itemId || stockLimitsRef.current[itemId] === undefined) return false;
    
    const item = items.find(item => item.id === itemId);
    const currentQuantity = item ? (item.quantity || 0) : 0;
    return currentQuantity >= stockLimitsRef.current[itemId];
  };
  
  // Ensure items is always an array for calculations
  const safeItems = Array.isArray(items) ? items : [];
  const totalItems = safeItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = safeItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  
  // Group items by provider for checkout
  const itemsByProvider = safeItems.reduce((groups, item) => {
    const providerId = item.providerId || 'unknown';
    if (!groups[providerId]) {
      groups[providerId] = {
        providerId,
        providerName: item.provider || 'Unknown',
        items: [],
        subtotal: 0
      };
    }
    groups[providerId].items.push(item);
    groups[providerId].subtotal += item.price * (item.quantity || 1);
    return groups;
  }, {});

  return (
    <CartContext.Provider value={{
      items: safeItems,
      isLoading,
      addItem,
      removeItem,
      updateItemQuantity,
      clearCart,
      isOpen,
      openCart,
      closeCart,
      totalItems,
      subtotal,
      itemsByProvider: Object.values(itemsByProvider),
      updateStockLimit,
      getRemainingStock,
      isAtMaxQuantity,
      stockLimits
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}