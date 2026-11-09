import { INITIAL_ORDERS } from '@/data/mockOrders';
import { Order, OrderStatus, CartItem, PaymentMethod, DiningType } from '@/types';
import { generateOrderId } from '@/lib/utils';
import { playChime } from '@/lib/sound';
import { supabase, supabaseConfig } from './supabaseClient';

const ORDERS_STORAGE_KEY = 'tb_canteen_orders';

type OrderSubscriber = (orders: Order[]) => void;
type SingleOrderSubscriber = (order: Order | null) => void;

class OrderService {
  private subscribers: Set<OrderSubscriber> = new Set();
  private singleSubscribers: Map<string, Set<SingleOrderSubscriber>> = new Map();
  private isRealtimeAttached = false;

  constructor() {
    this.initRealtimeSubscription();
  }

  private initRealtimeSubscription() {
    if (supabaseConfig.isConfigured && supabase && !this.isRealtimeAttached) {
      this.isRealtimeAttached = true;
      supabase
        .channel('public:orders_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          async () => {
            // Re-fetch all orders on any database change
            const freshOrders = await this.getAllOrders();
            this.notifySubscribers(freshOrders);
          }
        )
        .subscribe();
    }
  }

  private getStoredOrders(): Order[] {
    const data = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_ORDERS;
    }
  }

  private saveOrders(orders: Order[]): void {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    this.notifySubscribers(orders);
  }

  private notifySubscribers(orders: Order[]): void {
    // Notify global order subscribers (Kitchen, Staff, Admin)
    this.subscribers.forEach((sub) => sub(orders));

    // Notify individual active order subscribers (Student Tracking)
    this.singleSubscribers.forEach((subs, orderId) => {
      const order = orders.find((o) => o.id === orderId) || null;
      subs.forEach((sub) => sub(order));
    });

    window.dispatchEvent(new CustomEvent('tb_orders_updated', { detail: orders }));
  }

  /**
   * Subscribe to real-time order stream (matches Supabase Realtime channel subscription)
   */
  subscribeToOrders(callback: OrderSubscriber): () => void {
    this.subscribers.add(callback);
    // Initial call
    callback(this.getStoredOrders());
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Subscribe to a specific order updates
   */
  subscribeToOrder(orderId: string, callback: SingleOrderSubscriber): () => void {
    if (!this.singleSubscribers.has(orderId)) {
      this.singleSubscribers.set(orderId, new Set());
    }
    this.singleSubscribers.get(orderId)!.add(callback);

    const orders = this.getStoredOrders();
    const order = orders.find((o) => o.id === orderId) || null;
    callback(order);

    return () => {
      this.singleSubscribers.get(orderId)?.delete(callback);
      if (this.singleSubscribers.get(orderId)?.size === 0) {
        this.singleSubscribers.delete(orderId);
      }
    };
  }

  async getAllOrders(): Promise<Order[]> {
    if (supabaseConfig.isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            token_id,
            tokens ( token_number ),
            status,
            subtotal,
            discount,
            tax,
            packaging_fee,
            total,
            payment_method,
            payment_status,
            dining_type,
            counter_id,
            counter_bay,
            special_instructions,
            estimated_prep_minutes,
            created_at,
            cancelled_at,
            completed_at,
            profiles ( id, name, student_id ),
            order_items (
              id,
              item_name,
              item_description,
              unit_price,
              quantity,
              selected_addons,
              subtotal,
              special_instructions
            )
          `)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: Order[] = data.map((row: any) => ({
            id: row.id,
            orderNumber: row.order_number,
            tokenNumber: row.tokens?.token_number || 'A-000',
            userId: row.profiles?.id || '',
            userName: row.profiles?.name || 'Student',
            userStudentId: row.profiles?.student_id || 'STD-2024',
            items: (row.order_items || []).map((oi: any) => ({
              menuItemId: oi.id,
              name: oi.item_name,
              quantity: oi.quantity,
              unitPrice: oi.unit_price,
              selectedAddOns: oi.selected_addons || [],
              subtotal: oi.subtotal,
              specialInstructions: oi.special_instructions,
            })),
            subtotal: Number(row.subtotal),
            discount: Number(row.discount || 0),
            tax: Number(row.tax || 0),
            totalAmount: Number(row.total),
            status: row.status as OrderStatus,
            paymentMethod: row.payment_method as PaymentMethod,
            paymentStatus: row.payment_status,
            diningType: row.dining_type as DiningType,
            counterId: row.counter_id,
            counterBay: row.counter_bay,
            counterName: 'Hot Meals & Express Counter',
            estimatedTimeMinutes: row.estimated_prep_minutes,
            createdAt: row.created_at,
            notes: row.special_instructions,
          }));

          // Cache in localStorage and return
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
      }
    }

    return this.getStoredOrders();
  }

  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getAllOrders();
    return orders.find((o) => o.id === id) || null;
  }

  async getOrderByToken(tokenNumber: string): Promise<Order | null> {
    const orders = await this.getAllOrders();
    return orders.find((o) => o.tokenNumber.toLowerCase() === tokenNumber.toLowerCase()) || null;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const orders = await this.getAllOrders();
    return orders.filter((o) => o.userId === userId);
  }

  async getActiveUserOrder(userId: string): Promise<Order | null> {
    const orders = await this.getAllOrders();
    return (
      orders.find(
        (o) => o.userId === userId && (o.status === 'PLACED' || o.status === 'PREPARING' || o.status === 'READY')
      ) || null
    );
  }

  async createOrder(params: {
    userId: string;
    userName: string;
    userStudentId?: string;
    items: CartItem[];
    paymentMethod: PaymentMethod;
    diningType: DiningType;
    notes?: string;
  }): Promise<Order> {
    // If Supabase is configured and user is authenticated in Supabase, execute PostgreSQL atomic RPC
    if (supabaseConfig.isConfigured && supabase) {
      try {
        const payload = {
          p_items: params.items.map((item) => ({
            menu_item_id: item.menuItem.id,
            quantity: item.quantity,
            selected_addons: item.selectedAddOns,
            special_instructions: item.specialInstructions,
          })),
          p_dining_type: params.diningType,
          p_payment_method: params.paymentMethod,
          p_special_instructions: params.notes || null,
        };

        const { data, error } = await (supabase.rpc as any)('create_order_atomic', payload);
        if (error) throw error;

        if (data && (data as any).success) {
          playChime('tokenPing');
          // Re-fetch all orders
          const fresh = await this.getAllOrders();
          const newlyCreated = fresh.find((o) => o.id === (data as any).order_id);
          if (newlyCreated) return newlyCreated;
        }
      } catch (err: any) {
        console.warn('Supabase create_order_atomic error, proceeding with local fallback:', err);
      }
    }

    // Local state fallback
    const orders = this.getStoredOrders();
    
    // Generate next sequential token e.g. A-146
    const lastToken = orders[0]?.tokenNumber;
    let nextNum = 146;
    if (lastToken && lastToken.startsWith('A-')) {
      const parsed = parseInt(lastToken.replace('A-', ''), 10);
      if (!isNaN(parsed)) nextNum = parsed + 1;
    }

    const tokenNumber = `A-${nextNum}`;
    const orderNumber = generateOrderId();
    
    const subtotal = params.items.reduce((sum, item) => sum + item.itemTotal, 0);
    const packagingFee = params.diningType === 'TAKEAWAY' ? 10 : 0;
    const totalAmount = subtotal + packagingFee;

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber,
      tokenNumber,
      userId: params.userId,
      userName: params.userName,
      userStudentId: params.userStudentId || 'STD-2024',
      items: params.items.map((i) => ({
        menuItemId: i.menuItem.id,
        name: i.menuItem.name,
        quantity: i.quantity,
        unitPrice: i.menuItem.price,
        selectedAddOns: i.selectedAddOns,
        subtotal: i.itemTotal,
        specialInstructions: i.specialInstructions,
      })),
      subtotal,
      discount: 0,
      tax: 0,
      totalAmount,
      status: 'PLACED',
      paymentMethod: params.paymentMethod,
      paymentStatus: 'PAID',
      diningType: params.diningType,
      counterId: 'Counter 2',
      counterBay: 'Pickup Bay 2',
      counterName: 'Hot Meals & Express Counter',
      estimatedTimeMinutes: 8,
      createdAt: new Date().toISOString(),
      notes: params.notes,
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);
    playChime('tokenPing');

    return newOrder;
  }

  async cancelOrder(orderId: string, reason = 'Cancelled by student'): Promise<Order> {
    if (supabaseConfig.isConfigured && supabase) {
      try {
        const { data, error } = await (supabase.rpc as any)('cancel_order_student', {
          p_order_id: orderId,
          p_reason: reason,
        });
        if (!error && (data as any)?.success) {
          const fresh = await this.getAllOrders();
          const target = fresh.find((o) => o.id === orderId);
          if (target) return target;
        }
      } catch (err) {
        console.warn('Supabase cancel RPC failed, using local cancel:', err);
      }
    }

    return this.updateOrderStatus(orderId, 'CANCELLED');
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    if (supabaseConfig.isConfigured && supabase) {
      try {
        const { error } = await (supabase.from('orders') as any)
          .update({ status: newStatus })
          .eq('id', orderId);

        if (!error) {
          const fresh = await this.getAllOrders();
          const target = fresh.find((o) => o.id === orderId);
          if (target) return target;
        }
      } catch (err) {
        console.warn('Supabase update order status error:', err);
      }
    }

    const orders = this.getStoredOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const order = orders[index];
    order.status = newStatus;

    if (newStatus === 'PREPARING') {
      order.preparedAt = new Date().toISOString();
      order.estimatedTimeMinutes = Math.max(1, order.estimatedTimeMinutes - 2);
    } else if (newStatus === 'READY') {
      order.readyAt = new Date().toISOString();
      order.estimatedTimeMinutes = 0;
      playChime('orderReady');
    } else if (newStatus === 'COLLECTED') {
      order.collectedAt = new Date().toISOString();
    } else if (newStatus === 'CANCELLED') {
      order.cancelledAt = new Date().toISOString();
    }

    orders[index] = order;
    this.saveOrders(orders);
    return order;
  }
}

export const orderService = new OrderService();
