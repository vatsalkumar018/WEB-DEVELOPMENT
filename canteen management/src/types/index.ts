export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  phone?: string;
  avatarUrl?: string;
  walletBalance: number;
  block?: string;
  room?: string;
  createdAt: string;
}

export interface Profile extends User {
  dietaryPreference?: 'ALL' | 'VEG' | 'VEGAN' | 'JAIN';
  favoriteItemIds?: string[];
  notificationSettings?: {
    orderUpdates: boolean;
    canteenAnnouncements: boolean;
    soundChimes: boolean;
  };
}

export type MealTimeSlot = 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER' | 'ALL_DAY';

export interface TimeSlotConfig {
  slot: MealTimeSlot;
  label: string;
  timeRange: string;
  startHour: number; // 24-hr format (e.g. 7 for 7 AM)
  endHour: number;   // 24-hr format (e.g. 11 for 11 AM)
}

export type ItemCategory = 'MEALS' | 'BEVERAGES' | 'SNACKS' | 'DESSERTS';

export interface ProductAddOn {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  nameHi?: string;
  nameGu?: string;
  category: ItemCategory;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  servingSlots: MealTimeSlot[]; // e.g. ['LUNCH', 'DINNER']
  preparationTimeMinutes: number;
  isVeg: boolean;
  isFeatured?: boolean;
  isJainAvailable?: boolean;
  calories?: number;
  badge?: string; // 'Chef Special' | 'Fast Prep' | 'Hot' | 'Bestseller'
  rating: number;
  ratingCount: number;
  ingredients: string[];
  addOns?: ProductAddOn[];
}

export interface CartItem {
  cartItemId: string; // unique id per item+addons combination
  menuItem: MenuItem;
  quantity: number;
  selectedAddOns: ProductAddOn[];
  specialInstructions?: string;
  itemTotal: number;
}

export type OrderStatus = 'PLACED' | 'PREPARING' | 'READY' | 'COLLECTED' | 'CANCELLED';

export type PaymentMethod = 'CAMPUS_PAY' | 'UPI' | 'CASH_AT_COUNTER';

export type DiningType = 'DINE_IN' | 'TAKEAWAY';

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedAddOns: ProductAddOn[];
  subtotal: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g., "ORD-88291"
  tokenNumber: string; // e.g., "A-142"
  userId: string;
  userName: string;
  userStudentId?: string;
  userPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  diningType: DiningType;
  counterId: string; // e.g. "Counter 2"
  counterBay: string; // e.g. "Pickup Bay 2"
  counterName: string; // e.g. "Hot Meals & Beverages"
  estimatedTimeMinutes: number;
  createdAt: string;
  preparedAt?: string;
  readyAt?: string;
  collectedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  notes?: string;
}

export type NotificationType = 'ORDER_READY' | 'ORDER_PREPARING' | 'CANTEEN_ANNOUNCEMENT' | 'ITEM_UNAVAILABLE' | 'SERVICE_TIMING';

export interface Notification {
  id: string;
  userId?: string; // empty means broadcast to all
  title: string;
  message: string;
  type: NotificationType;
  orderId?: string;
  tokenNumber?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface FeedbackRating {
  id: string;
  orderId: string;
  userId: string;
  overallRating: number; // 1 to 5
  foodQuality: number;
  waitingTime: number;
  staffBehaviour: number;
  cleanliness: number;
  comments?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string; // 'kg', 'liters', 'servings', 'pcs'
  status: 'HEALTHY' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  lastRestocked: string;
}

export interface CanteenMetrics {
  isOpen: boolean;
  rushMode: boolean;
  currentServingSlot: MealTimeSlot;
  averageWaitMinutes: number;
  activeOrdersCount: number;
  prepCount: number;
  readyCount: number;
  totalTodayOrders: number;
  todaySalesAmount: number;
}

