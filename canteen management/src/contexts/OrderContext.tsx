import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus, CartItem, PaymentMethod, DiningType, CanteenMetrics } from '@/types';
import { orderService } from '@/services/orderService';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  metrics: CanteenMetrics;
  placeOrder: (params: {
    items: CartItem[];
    paymentMethod: PaymentMethod;
    diningType: DiningType;
    notes?: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<Order>;
  getOrderById: (orderId: string) => Order | null;
  getOrderByToken: (token: string) => Order | null;
  toggleRushMode: () => void;
  simulateIncomingOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRushMode, setIsRushMode] = useState<boolean>(false);

  // Subscribe to real-time order changes
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = orderService.subscribeToOrders((updatedOrders) => {
      setOrders([...updatedOrders]);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Compute active order for current student
  useEffect(() => {
    if (!user) {
      setActiveOrder(null);
      return;
    }

    if (user.role === 'STUDENT') {
      const active = orders.find(
        (o) =>
          o.userId === user.id &&
          (o.status === 'PLACED' || o.status === 'PREPARING' || o.status === 'READY')
      );
      // Fallback: if student has no active order of their own ID, show the featured A-142 order for preview
      setActiveOrder(active || orders.find((o) => o.tokenNumber === 'A-142') || null);
    } else {
      setActiveOrder(null);
    }
  }, [orders, user]);

  const placeOrder = async (params: {
    items: CartItem[];
    paymentMethod: PaymentMethod;
    diningType: DiningType;
    notes?: string;
  }): Promise<Order> => {
    if (!user) throw new Error('User must be logged in to order');
    const order = await orderService.createOrder({
      userId: user.id,
      userName: user.name,
      userStudentId: user.studentId,
      items: params.items,
      paymentMethod: params.paymentMethod,
      diningType: params.diningType,
      notes: params.notes,
    });
    return order;
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus): Promise<Order> => {
    return orderService.updateOrderStatus(orderId, newStatus);
  };

  const getOrderById = useCallback(
    (orderId: string): Order | null => {
      return orders.find((o) => o.id === orderId) || null;
    },
    [orders]
  );

  const getOrderByToken = useCallback(
    (token: string): Order | null => {
      return (
        orders.find(
          (o) => o.tokenNumber.toLowerCase().replace(/[^a-z0-9]/g, '') === token.toLowerCase().replace(/[^a-z0-9]/g, '')
        ) || null
      );
    },
    [orders]
  );

  const toggleRushMode = () => {
    setIsRushMode((prev) => !prev);
  };

  const simulateIncomingOrder = () => {
    const randomTokens = ['A-147', 'A-148', 'A-149', 'A-150', 'A-151'];
    const chosenToken = randomTokens[Math.floor(Math.random() * randomTokens.length)];
    const mockOrder: Order = {
      id: 'ord-sim-' + Date.now(),
      orderNumber: 'ORD-' + Math.floor(80000 + Math.random() * 9999),
      tokenNumber: chosenToken,
      userId: 'std-sim',
      userName: 'Campus Student',
      userStudentId: 'CS-2024-99',
      items: [
        {
          menuItemId: 'item-5',
          name: 'Cheese Butter Maggi',
          quantity: 1,
          unitPrice: 45,
          subtotal: 45,
          selectedAddOns: [],
        },
        {
          menuItemId: 'item-6',
          name: 'Masala Adrak Chai',
          quantity: 1,
          unitPrice: 15,
          subtotal: 15,
          selectedAddOns: [],
        },
      ],
      subtotal: 60,
      discount: 0,
      tax: 0,
      totalAmount: 60,
      status: 'PLACED',
      paymentMethod: 'CAMPUS_PAY',
      paymentStatus: 'PAID',
      diningType: 'DINE_IN',
      counterId: 'Counter 2',
      counterBay: 'Pickup Bay 2',
      counterName: 'Express Wok',
      estimatedTimeMinutes: 5,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [mockOrder, ...prev]);
  };

  // High-density operational metrics calculated dynamically
  const prepCount = orders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;
  const queuedCount = orders.filter((o) => o.status === 'PLACED').length;
  const completedCount = orders.filter((o) => o.status === 'COLLECTED').length;
  const totalToday = orders.length;
  const todaySales = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const metrics: CanteenMetrics = {
    isOpen: !isRushMode,
    rushMode: isRushMode,
    currentServingSlot: 'LUNCH',
    averageWaitMinutes: isRushMode ? 14 : 8,
    activeOrdersCount: prepCount + readyCount + queuedCount,
    prepCount,
    readyCount,
    totalTodayOrders: totalToday,
    todaySalesAmount: todaySales,
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeOrder,
        isLoading,
        metrics,
        placeOrder,
        updateOrderStatus,
        getOrderById,
        getOrderByToken,
        toggleRushMode,
        simulateIncomingOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within an OrderProvider');
  return ctx;
};

