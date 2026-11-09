import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem, ProductAddOn } from '@/types';
import { playChime } from '@/lib/sound';

interface CartContextType {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    item: MenuItem,
    quantity?: number,
    addOns?: ProductAddOn[],
    specialInstructions?: string
  ) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  getItemQuantity: (menuItemId: string) => number;
}

const CART_STORAGE_KEY = 'tb_canteen_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Default initial cart matching the Stitch mockup preview (Special Thali + Cold Coffee)
    return [
      {
        cartItemId: 'item-1-default',
        menuItem: {
          id: 'item-1',
          name: 'Special Deluxe Thali',
          category: 'MEALS',
          description: 'Basmati rice, 2 rotis, paneer lababdar, dal makhani, curd, and hot gulab jamun.',
          price: 90,
          imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuARE2Qk8KYiO1LvTodv4jU9THsa_hYfTZKCowcbyVX_175LfDoc4DPhqtNL99OXDlHfzNz7mHtlWZbweruj9wLDPYZfd3Gs22DeStBq4Z1zcxkZHJJfFvvg3bzSPdhM-yt2egGt8FrSp5LwodQH1VzyWNKIFc_YV2S8Z3BgmaQFoALVD8jHqogks_VweR1W7_hLRinE2DfzHlNOQ2b9k6vfhefC7WcMZdFcdI27eUAg',
          isAvailable: true,
          servingSlots: ['LUNCH', 'DINNER'],
          preparationTimeMinutes: 8,
          isVeg: true,
          rating: 4.8,
          ratingCount: 342,
          ingredients: ['Basmati Rice', 'Shahi Paneer', 'Dal Makhani', '2 Butter Rotis', 'Sweet Curd'],
        },
        quantity: 1,
        selectedAddOns: [
          { id: 'addon-1', name: 'Extra Butter Roti (1 pc)', price: 10, isAvailable: true },
        ],
        specialInstructions: 'Extra butter on roti',
        itemTotal: 100,
      },
      {
        cartItemId: 'item-3-default',
        menuItem: {
          id: 'item-3',
          name: 'Campus Cold Coffee',
          category: 'BEVERAGES',
          description: 'Chilled creamy espresso blend shaken over ice with smooth chocolate drizzle.',
          price: 50,
          imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAk-SitAYbmDgmLuE60Yj1xnyBhMnMCQpBgiKLAhts2fhxnKhMOpqgAw3HdNHYXjSOzLl5kaskNvacv6DZT6YFRkHKlGZz6pDGnOYreeD9bgMIg-tjmFLbbBwaGxpWwDxBvLTwnR8hembdorPyOdfc7pQeHyD9p-MWmMVxd51EJrIM0VSwndd0-TF_wnW41uH04yQEFg8ohFKCfVqJhDd57uhc_RPYEJ-JgrcRt-T5d',
          isAvailable: true,
          servingSlots: ['ALL_DAY'],
          preparationTimeMinutes: 3,
          isVeg: true,
          rating: 4.9,
          ratingCount: 680,
          ingredients: ['Espresso Shot', 'Chilled Milk', 'Cocoa Powder', 'Sugar', 'Ice'],
        },
        quantity: 1,
        selectedAddOns: [],
        specialInstructions: '50% Less Sugar',
        itemTotal: 50,
      },
    ];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (
    item: MenuItem,
    quantity: number = 1,
    addOns: ProductAddOn[] = [],
    specialInstructions?: string
  ) => {
    playChime('click');
    setItems((prev) => {
      // Create a unique cart item ID based on item id and addon ids
      const addOnKey = addOns
        .map((a) => a.id)
        .sort()
        .join('-');
      const cartItemId = `${item.id}-${addOnKey}-${specialInstructions || 'none'}`;

      const existingIndex = prev.findIndex((i) => i.cartItemId === cartItemId);
      const addOnsTotal = addOns.reduce((sum, a) => sum + a.price, 0);
      const unitCost = item.price + addOnsTotal;

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          itemTotal: newQty * unitCost,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          cartItemId,
          menuItem: item,
          quantity,
          selectedAddOns: addOns,
          specialInstructions,
          itemTotal: quantity * unitCost,
        };
        return [...prev, newItem];
      }
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const addOnsTotal = item.selectedAddOns.reduce((sum, a) => sum + a.price, 0);
            const unitCost = item.menuItem.price + addOnsTotal;
            return {
              ...item,
              quantity: newQty,
              itemTotal: newQty * unitCost,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (menuItemId: string): number => {
    return items
      .filter((i) => i.menuItem.id === menuItemId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
  const total = subtotal; // campus subsidy discount handled at checkout

  return (
    <CartContext.Provider
      value={{
        items,
        totalQuantity,
        subtotal,
        total,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};

