import type { Product } from './product';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: Product;
}

export interface CartSummary {
  subtotal: number;
  total_items: number;
  total_quantity: number;
}

export interface Cart {
  items: CartItem[];
  summary: CartSummary;
}

export interface AddToCartData {
  product_id: string;
  quantity: number;
}

export interface UpdateCartData {
  quantity: number;
}

export interface CartValidation {
  valid: boolean;
  errors: string[];
  out_of_stock: string[];
  price_changed: string[];
}
