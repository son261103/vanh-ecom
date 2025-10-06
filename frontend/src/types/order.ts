import type { Product } from './product';
import type { User } from './auth';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
  product: Product;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  subtotal: number;
  tax: number;
  shipping_fee: number;
  discount: number;
  total: number;
  shipping_address: string;
  billing_address: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
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
