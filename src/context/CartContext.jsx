import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'cartmind_cart_items';
const BUDGET_STORAGE_KEY = 'cartmind_user_budget';

export function CartProvider({ children }) {
  // Load initial cart from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse cart from localStorage:', e);
      return [];
    }
  });

  // Load initial budget from localStorage (default ₹15,000)
  const [budget, setBudgetState] = useState(() => {
    try {
      const saved = localStorage.getItem(BUDGET_STORAGE_KEY);
      return saved ? Number(saved) : 15000;
    } catch (e) {
      console.error('Failed to parse budget from localStorage:', e);
      return 15000;
    }
  });

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(current => (current?.id === Date.now() ? null : current));
    }, 3200);
  };

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  // Sync budget to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BUDGET_STORAGE_KEY, budget.toString());
    } catch (e) {
      console.error('Failed to save budget to localStorage:', e);
    }
  }, [budget]);

  // Budget updater
  const setBudget = (newBudget) => {
    const val = Math.max(0, Number(newBudget) || 0);
    setBudgetState(val);
  };

  // Add product to cart
  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity }];
      }
    });
    showToast(`Added "${product.name}" to your cart!`, 'success');
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove single product
  const removeFromCart = (productId) => {
    setCart(prev => {
      const item = prev.find(i => i.product.id === productId);
      if (item) {
        showToast(`Removed "${item.product.name}"`, 'info');
      }
      return prev.filter(i => i.product.id !== productId);
    });
  };

  // Replace item with alternative
  const swapItemInCart = (oldProductId, newProduct) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === oldProductId) {
          return { product: newProduct, quantity: item.quantity };
        }
        return item;
      })
    );
    showToast(`Swapped for "${newProduct.name}"`, 'success');
  };

  // Apply optimized recommendation batch to cart
  const applyOptimizedCart = (recommendedItems, newBudget) => {
    if (newBudget) {
      setBudget(newBudget);
    }
    const formattedCart = recommendedItems.map(item => ({
      product: item,
      quantity: 1
    }));
    setCart(formattedCart);
    showToast(`Optimized cart applied with ${recommendedItems.length} items!`, 'success');
  };

  // Clear all items
  const clearCart = () => {
    setCart([]);
    showToast('Your shopping cart has been cleared', 'info');
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return cart.some(item => item.product.id === productId);
  };

  // Get item quantity in cart
  const getItemQuantity = (productId) => {
    const item = cart.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Computed metrics
  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartOriginalTotal = cart.reduce((acc, item) => acc + (item.product.originalPrice || item.product.price) * item.quantity, 0);
  const cartSavings = Math.max(0, cartOriginalTotal - cartTotal);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const remainingBudget = Math.max(0, budget - cartTotal);
  const isOverBudget = cartTotal > budget;
  const budgetUtilization = budget > 0 ? Math.min(100, Math.round((cartTotal / budget) * 100)) : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        budget,
        setBudget,
        addToCart,
        updateQuantity,
        removeFromCart,
        swapItemInCart,
        applyOptimizedCart,
        clearCart,
        isInCart,
        getItemQuantity,
        cartTotal,
        cartOriginalTotal,
        cartSavings,
        cartCount,
        remainingBudget,
        isOverBudget,
        budgetUtilization,
        toast,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
