/**
-- ============================================================================
-- CANTEEN MANAGEMENT SYSTEM - SUPABASE DATABASE TYPES
-- Generated TypeScript definitions mapping directly to PostgreSQL schema
-- ============================================================================
*/

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = 'STUDENT' | 'STAFF' | 'ADMIN';
export type OrderStatus = 'PLACED' | 'PREPARING' | 'READY' | 'COLLECTED' | 'CANCELLED';
export type PaymentMethodType = 'CAMPUS_PAY' | 'UPI' | 'CASH_AT_COUNTER';
export type DiningTypeEnum = 'DINE_IN' | 'TAKEAWAY';
export type InventoryStatus = 'HEALTHY' | 'LOW' | 'OUT_OF_STOCK';
export type FeedbackCategory = 'FOOD_QUALITY' | 'WAITING_TIME' | 'STAFF_BEHAVIOUR' | 'CLEANLINESS' | 'OVERALL';
export type NotificationType = 'ORDER_READY' | 'ORDER_UPDATE' | 'CANTEEN_ANNOUNCEMENT' | 'ITEM_UNAVAILABLE' | 'SERVICE_UPDATE';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          student_id: string | null;
          email: string;
          phone: string | null;
          role: AppRole;
          wallet_balance: number;
          avatar_url: string | null;
          campus_block: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          student_id?: string | null;
          email: string;
          phone?: string | null;
          role?: AppRole;
          wallet_balance?: number;
          avatar_url?: string | null;
          campus_block?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          student_id?: string | null;
          email?: string;
          phone?: string | null;
          role?: AppRole;
          wallet_balance?: number;
          avatar_url?: string | null;
          campus_block?: string | null;
          updated_at?: string;
        };
      };
      menu_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          display_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          display_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          display_order?: number;
          active?: boolean;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string | null;
          ingredients: string[];
          price: number;
          image_url: string | null;
          available: boolean;
          featured: boolean;
          is_veg: boolean;
          preparation_time_minutes: number;
          calories: number | null;
          serving_start: string;
          serving_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description?: string | null;
          ingredients?: string[];
          price: number;
          image_url?: string | null;
          available?: boolean;
          featured?: boolean;
          is_veg?: boolean;
          preparation_time_minutes?: number;
          calories?: number | null;
          serving_start?: string;
          serving_end?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          ingredients?: string[];
          price?: number;
          image_url?: string | null;
          available?: boolean;
          featured?: boolean;
          is_veg?: boolean;
          preparation_time_minutes?: number;
          calories?: number | null;
          serving_start?: string;
          serving_end?: string;
          updated_at?: string;
        };
      };
      canteen_settings: {
        Row: {
          id: number;
          is_open: boolean;
          rush_mode: boolean;
          rush_pause_orders: boolean;
          current_service: string;
          average_wait_minutes: number;
          active_announcement: string | null;
          primary_counter: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          is_open?: boolean;
          rush_mode?: boolean;
          rush_pause_orders?: boolean;
          current_service?: string;
          average_wait_minutes?: number;
          active_announcement?: string | null;
          primary_counter?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          is_open?: boolean;
          rush_mode?: boolean;
          rush_pause_orders?: boolean;
          current_service?: string;
          average_wait_minutes?: number;
          active_announcement?: string | null;
          primary_counter?: string;
          updated_at?: string;
        };
      };
      tokens: {
        Row: {
          id: string;
          token_number: string;
          order_id: string | null;
          service_date: string;
          status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
          created_at: string;
        };
        Insert: {
          id?: string;
          token_number: string;
          order_id?: string | null;
          service_date?: string;
          status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
          created_at?: string;
        };
        Update: {
          id?: string;
          token_number?: string;
          order_id?: string | null;
          service_date?: string;
          status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          token_id: string | null;
          status: OrderStatus;
          subtotal: number;
          discount: number;
          tax: number;
          packaging_fee: number;
          total: number;
          payment_method: PaymentMethodType;
          payment_status: 'PAID' | 'PENDING' | 'REFUNDED';
          dining_type: DiningTypeEnum;
          counter_id: string;
          counter_bay: string;
          special_instructions: string | null;
          estimated_prep_minutes: number;
          created_at: string;
          updated_at: string;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_number: string;
          token_id?: string | null;
          status?: OrderStatus;
          subtotal: number;
          discount?: number;
          tax?: number;
          packaging_fee?: number;
          total: number;
          payment_method?: PaymentMethodType;
          payment_status?: 'PAID' | 'PENDING' | 'REFUNDED';
          dining_type?: DiningTypeEnum;
          counter_id?: string;
          counter_bay?: string;
          special_instructions?: string | null;
          estimated_prep_minutes?: number;
          created_at?: string;
          updated_at?: string;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          status?: OrderStatus;
          payment_status?: 'PAID' | 'PENDING' | 'REFUNDED';
          estimated_prep_minutes?: number;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string | null;
          item_name: string;
          item_description: string | null;
          unit_price: number;
          quantity: number;
          selected_addons: Json;
          subtotal: number;
          special_instructions: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id?: string | null;
          item_name: string;
          item_description?: string | null;
          unit_price: number;
          quantity: number;
          selected_addons?: Json;
          subtotal: number;
          special_instructions?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          quantity?: number;
          subtotal?: number;
        };
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          old_status: OrderStatus | null;
          new_status: OrderStatus;
          changed_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          old_status?: OrderStatus | null;
          new_status: OrderStatus;
          changed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          ingredient_name: string;
          category: string;
          quantity: number;
          unit: string;
          minimum_quantity: number;
          status: InventoryStatus;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ingredient_name: string;
          category?: string;
          quantity?: number;
          unit: string;
          minimum_quantity?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ingredient_name?: string;
          category?: string;
          quantity?: number;
          unit?: string;
          minimum_quantity?: number;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          message: string;
          type: NotificationType;
          order_id: string | null;
          token_number: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          message: string;
          type?: NotificationType;
          order_id?: string | null;
          token_number?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          read?: boolean;
        };
      };
      feedback: {
        Row: {
          id: string;
          user_id: string;
          order_id: string;
          rating: number;
          food_quality: number | null;
          waiting_time: number | null;
          staff_behaviour: number | null;
          cleanliness: number | null;
          category: FeedbackCategory;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_id: string;
          rating: number;
          food_quality?: number | null;
          waiting_time?: number | null;
          staff_behaviour?: number | null;
          cleanliness?: number | null;
          category?: FeedbackCategory;
          comment?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      v_kitchen_active_orders: {
        Row: {
          order_id: string;
          order_number: string;
          token_number: string | null;
          status: OrderStatus;
          dining_type: DiningTypeEnum;
          special_instructions: string | null;
          estimated_prep_minutes: number;
          created_at: string;
          elapsed_minutes: number;
          items: Json;
        };
      };
    };
    Functions: {
      create_order_atomic: {
        Args: {
          p_items: Json;
          p_dining_type?: string;
          p_payment_method?: string;
          p_special_instructions?: string;
        };
        Returns: Json;
      };
      cancel_order_student: {
        Args: {
          p_order_id: string;
          p_reason?: string;
        };
        Returns: Json;
      };
      get_canteen_live_status: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      get_admin_analytics: {
        Args: {
          p_date?: string;
        };
        Returns: Json;
      };
    };
  };
}
