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
    if (!isLoading && items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isLoading]);

  const addItem = (item) => {
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
        return [...currentItems, { ...item, quantity: 1 }];
      }
    });
  };

  const removeItem = (itemId) => {
    setItems(prevItems => {
      // Ensure prevItems is an array
      const currentItems = Array.isArray(prevItems) ? prevItems : [];
      return currentItems.filter(item => item.id !== itemId);
    });
    
    // If cart becomes empty, remove from localStorage
    if (items.length === 1) {
      localStorage.removeItem('cart');
    }
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
      subtotal
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