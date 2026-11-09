import { Notification } from '@/types';

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'std-1',
    title: 'Order in Final Assembly!',
    message: 'Token #A-142 is being plated at Counter 2. Please head over to Pickup Bay 2.',
    type: 'ORDER_PREPARING',
    orderId: 'ord-142',
    tokenNumber: 'A-142',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    actionUrl: '/orders/ord-142',
  },
  {
    id: 'notif-2',
    title: 'Lunch Service is Now Active',
    message: 'Special Gujarati & North Indian Thalis are now fresh & hot at Block 4.',
    type: 'SERVICE_TIMING',
    isRead: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    actionUrl: '/menu',
  },
  {
    id: 'notif-3',
    userId: 'std-1',
    title: 'Order Collected Successfully',
    message: 'Token #A-128 was collected. Rate your experience to help our kitchen!',
    type: 'ORDER_READY',
    orderId: 'ord-128',
    tokenNumber: 'A-128',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/feedback?orderId=ord-128',
  },
  {
    id: 'notif-4',
    title: 'Campus Pay Cashback Day',
    message: 'Get 5% instant subsidy cashback on all thali orders via student wallet today.',
    type: 'CANTEEN_ANNOUNCEMENT',
    isRead: true,
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
];

