import type { Product } from './product';
import type { User } from './auth';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name?: string; // Saved product name
  sku?: string; // Saved SKU
  quantity: number;
  unit_price: number; // Backend returns as unit_price
  total_price: number; // Backend returns as total_price
  price?: number; // For backwards compatibility
  subtotal?: number; // For backwards compatibility
  created_at: string;
  updated_at: string;
  product?: Product; // Optional - may be null if product deleted
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  total_amount: string | number; // Backend returns as string
  subtotal?: number;
  tax?: number;
  shipping_fee?: number;
  discount?: number;
  shipping_address: string;
  billing_address: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  items_count?: number;
  total_quantity?: number;
  user?: User;
}

export interface OrderTimeline {
  status: OrderStatus;
  label: string;
  completed: boolean;
  date: string | null;
}

export interface CreateOrderData {
  payment_method: string;
  shipping_address: string;
  billing_address: string;
  notes?: string;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
}

export interface RevenueStats {
  period: string;
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  daily_revenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}
