'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load cart from localStorage on client side
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setItems(Array.isArray(parsedCart) ? parsedCart : []);
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      if (items.length > 0) {
        localStorage.setItem('cart', JSON.stringify(items));
      } else {
        localStorage.removeItem('cart');
      }
    }
  }, [items, isLoading]);

  const addItem = (item) => {
    if (!item.id || !item.name || !item.price) {
      console.error("Cannot add invalid item to cart", item);
      return;
    }
    
    setItems(prevItems => {
      // Ensure prevItems is an array
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      
      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: (updatedItems[existingItemIndex].quantity || 1) + 1
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
    
    setItems(prevItems => {
      // Ensure prevItems is an array
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      return currentItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  
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
      itemsByProvider: Object.values(itemsByProvider)
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