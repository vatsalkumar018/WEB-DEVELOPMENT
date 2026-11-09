/**
 * Supabase Client Initialization & Production Helper
 *
 * Provides a typed Supabase client configured from environment variables.
 * When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present, requests flow
 * directly to the live PostgreSQL backend with Row Level Security and Realtime.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConfigured: boolean;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseConfig: SupabaseConfig = {
  supabaseUrl,
  supabaseAnonKey,
  isConfigured: Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')),
};

export const supabase: SupabaseClient<Database> | null = supabaseConfig.isConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export const SUPABASE_TABLES = {
  PROFILES: 'profiles',
  MENU_CATEGORIES: 'menu_categories',
  MENU_ITEMS: 'menu_items',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  TOKENS: 'tokens',
  ORDER_STATUS_HISTORY: 'order_status_history',
  INVENTORY: 'inventory',
  INVENTORY_TRANSACTIONS: 'inventory_transactions',
  NOTIFICATIONS: 'notifications',
  FEEDBACK: 'feedback',
  CANTEEN_SETTINGS: 'canteen_settings',
  OPERATING_HOURS: 'operating_hours',
} as const;

export const REALTIME_CHANNELS = {
  ORDERS: 'realtime_orders',
  TOKENS: 'realtime_tokens',
  NOTIFICATIONS: 'realtime_notifications',
  CANTEEN_SETTINGS: 'realtime_canteen_settings',
} as const;
