import { create } from 'zustand';
import type { Cart, AddToCartData, Product } from '../types';
import { cartService } from '../services/cartService';
import toast from 'react-hot-toast';

interface CartState {
  cart: Cart | null;
  cartCount: number;
  recommendations: Product[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (data: AddToCartData) => Promise<void>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCartCount: () => Promise<void>;
  validateCart: () => Promise<boolean>;
  fetchRecommendations: () => Promise<void>;
  applyDiscount: (code: string) => Promise<boolean>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  cartCount: 0,
  recommendations: [],
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.getCart();
      set({ cart, cartCount: cart.summary.total_items, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to load cart');
    }
  },

  addToCart: async (data: AddToCartData) => {
    set({ isLoading: true, error: null });
    try {
      await cartService.addToCart(data);
      await get().fetchCart();
      toast.success('Item added to cart');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
    }
  },

  updateCartItem: async (cartItemId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      await cartService.updateCartItem(cartItemId, { quantity });
      await get().fetchCart();
      toast.success('Cart updated');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to update cart');
    }
  },

  removeFromCart: async (cartItemId: string) => {
    set({ isLoading: true, error: null });
    try {
      await cartService.removeFromCart(cartItemId);
      await get().fetchCart();
      toast.success('Item removed from cart');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to remove item');
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartService.clearCart();
      set({ cart: null, cartCount: 0, isLoading: false });
      toast.success('Cart cleared');
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to clear cart');
    }
  },

  fetchCartCount: async () => {
    try {
      const count = await cartService.getCartCount();
      set({ cartCount: count });
    } catch (error: any) {
      console.error('Failed to fetch cart count:', error);
    }
  },

  validateCart: async () => {
    try {
      const validation = await cartService.validateCart();
      if (!validation.valid) {
        validation.errors.forEach((error) => toast.error(error));
      }
      return validation.valid;
    } catch (error: any) {
      toast.error('Failed to validate cart');
      return false;
    }
  },

  fetchRecommendations: async () => {
    try {
      const recommendations = await cartService.getRecommendations();
      set({ recommendations });
    } catch (error: any) {
      console.error('Failed to fetch recommendations:', error);
    }
  },

  applyDiscount: async (code: string) => {
    try {
      const response = await cartService.applyDiscount(code);
      if (response.success) {
        await get().fetchCart();
        toast.success('Discount code applied successfully');
        return true;
      }
      toast.error(response.message || 'Invalid discount code');
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply discount code');
      return false;
    }
  },
}));
