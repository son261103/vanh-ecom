import { api } from '../lib/axios';
import type { Cart, AddToCartData, UpdateCartData, CartValidation, Product } from '../types';

export const cartService = {
  // Get user's cart
  async getCart(): Promise<Cart> {
    const response = await api.get('/user/cart');
    return response.data.data;
  },

  // Add item to cart
  async addToCart(data: AddToCartData) {
    const response = await api.post('/user/cart', data);
    return response.data;
  },

  // Update cart item quantity
  async updateCartItem(cartItemId: string, data: UpdateCartData) {
    const response = await api.put(`/user/cart/${cartItemId}`, data);
    return response.data;
  },

  // Remove item from cart
  async removeFromCart(cartItemId: string) {
    const response = await api.delete(`/user/cart/${cartItemId}`);
    return response.data;
  },

  // Clear all items from cart
  async clearCart() {
    const response = await api.delete('/user/cart');
    return response.data;
  },

  // Get cart items count
  async getCartCount(): Promise<number> {
    const response = await api.get('/user/cart/count');
    return response.data.data.count;
  },

  // Validate cart before checkout
  async validateCart(): Promise<CartValidation> {
    const response = await api.get('/user/cart/validate');
    return response.data.data;
  },

  // Get recommended products based on cart
  async getRecommendations(): Promise<Product[]> {
    const response = await api.get('/user/cart/recommendations');
    return response.data.data;
  },

  // Apply discount code
  async applyDiscount(discountCode: string) {
    const response = await api.post('/user/cart/apply-discount', {
      discount_code: discountCode,
    });
    return response.data;
  },
};
