/**
 * Canteen Service - Status, Operating Hours & Admin Analytics
 *
 * Supports live PostgreSQL RPCs when Supabase is configured,
 * with instantaneous local fallback.
 */

import { supabase, supabaseConfig } from './supabaseClient';

export interface CanteenLiveStatus {
  isOpen: boolean;
  rushMode: boolean;
  rushPauseOrders: boolean;
  currentService: string;
  averageWaitMinutes: number;
  activeAnnouncement: string | null;
  primaryCounter: string;
  activeOrdersCount: number;
  preparingOrdersCount: number;
  readyOrdersCount: number;
  latestReadyToken: string | null;
  latestPreparingToken: string | null;
}

export interface AdminAnalyticsReport {
  date: string;
  todaySales: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  peakHour: string;
  mostOrderedItem: string;
  lowStockCount: number;
  hourlyOrders: Array<{ hour: string; orders: number; revenue: number }>;
  popularItems: Array<{ name: string; quantity: number; revenue: number }>;
  categoryStats: Array<{ category: string; orders_count: number; revenue: number }>;
  paymentStats: Array<{ method: string; count: number; total: number }>;
}

const DEFAULT_STATUS: CanteenLiveStatus = {
  isOpen: true,
  rushMode: false,
  rushPauseOrders: false,
  currentService: 'LUNCH',
  averageWaitMinutes: 8,
  activeAnnouncement: 'Hot Meals & Beverages available now. Display your token on screen when called at Counter 2!',
  primaryCounter: 'Counter 2',
  activeOrdersCount: 5,
  preparingOrdersCount: 2,
  readyOrdersCount: 2,
  latestReadyToken: 'A-139',
  latestPreparingToken: 'A-142',
};

class CanteenService {
  async getLiveStatus(): Promise<CanteenLiveStatus> {
    if (supabaseConfig.isConfigured && supabase) {
      try {
        const { data, error } = await (supabase.rpc as any)('get_canteen_live_status');
        if (error) throw error;
        if (data) {
          return {
            isOpen: (data as any).is_open,
            rushMode: (data as any).rush_mode,
            rushPauseOrders: (data as any).rush_pause_orders,
            currentService: (data as any).current_service,
            averageWaitMinutes: (data as any).average_wait_minutes,
            activeAnnouncement: (data as any).active_announcement,
            primaryCounter: (data as any).primary_counter,
            activeOrdersCount: (data as any).active_orders_count,
            preparingOrdersCount: (data as any).preparing_orders_count,
            readyOrdersCount: (data as any).ready_orders_count,
            latestReadyToken: (data as any).latest_ready_token,
            latestPreparingToken: (data as any).latest_preparing_token,
          };
        }
      } catch (err) {
        console.warn('Supabase get_canteen_live_status RPC failed, using local status:', err);
      }
    }

    return DEFAULT_STATUS;
  }

  async getAdminAnalytics(date?: string): Promise<AdminAnalyticsReport> {
    const targetDate = date || new Date().toISOString().split('T')[0];

    if (supabaseConfig.isConfigured && supabase) {
      try {
        const { data, error } = await (supabase.rpc as any)('get_admin_analytics', {
          p_date: targetDate,
        });
        if (error) throw error;
        if (data) {
          return {
            date: (data as any).date,
            todaySales: Number((data as any).today_sales || 0),
            totalOrders: Number((data as any).total_orders || 0),
            completedOrders: Number((data as any).completed_orders || 0),
            cancelledOrders: Number((data as any).cancelled_orders || 0),
            averageOrderValue: Number((data as any).average_order_value || 0),
            peakHour: (data as any).peak_hour,
            mostOrderedItem: (data as any).most_ordered_item,
            lowStockCount: Number((data as any).low_stock_count || 0),
            hourlyOrders: (data as any).hourly_orders || [],
            popularItems: (data as any).popular_items || [],
            categoryStats: (data as any).category_stats || [],
            paymentStats: (data as any).payment_stats || [],
          };
        }
      } catch (err) {
        console.warn('Supabase get_admin_analytics RPC failed, fallback to mock metrics:', err);
      }
    }

    // Default mock report
    return {
      date: targetDate,
      todaySales: 18450,
      totalOrders: 142,
      completedOrders: 138,
      cancelledOrders: 4,
      averageOrderValue: 129.92,
      peakHour: '12:00 PM - 01:00 PM',
      mostOrderedItem: 'Special Veg Thali',
      lowStockCount: 2,
      hourlyOrders: [
        { hour: '08 AM', orders: 12, revenue: 980 },
        { hour: '09 AM', orders: 18, revenue: 1450 },
        { hour: '10 AM', orders: 15, revenue: 1200 },
        { hour: '11 AM', orders: 22, revenue: 2100 },
        { hour: '12 PM', orders: 48, revenue: 6400 },
        { hour: '01 PM', orders: 36, revenue: 4200 },
        { hour: '02 PM', orders: 14, revenue: 1350 },
        { hour: '03 PM', orders: 8, revenue: 650 },
        { hour: '04 PM', orders: 19, revenue: 1820 },
      ],
      popularItems: [
        { name: 'Special Veg Thali', quantity: 64, revenue: 5760 },
        { name: 'Samosa Pav Duo', quantity: 58, revenue: 2030 },
        { name: 'Double Cheese Maggi', quantity: 42, revenue: 2100 },
        { name: 'Cutting Masala Chai', quantity: 96, revenue: 1440 },
        { name: 'Cold Coffee with Scoop', quantity: 32, revenue: 1920 },
      ],
      categoryStats: [
        { category: 'Meals', orders_count: 82, revenue: 9840 },
        { category: 'Snacks', orders_count: 64, revenue: 4820 },
        { category: 'Beverages', orders_count: 110, revenue: 3120 },
        { category: 'Desserts', orders_count: 24, revenue: 670 },
      ],
      paymentStats: [
        { method: 'CAMPUS_PAY', count: 98, total: 12740 },
        { method: 'UPI', count: 38, total: 4950 },
        { method: 'CASH_AT_COUNTER', count: 6, total: 760 },
      ],
    };
  }
}

export const canteenService = new CanteenService();
