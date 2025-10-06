import { api } from '../lib/axios';
import type { Order, CreateOrderData, OrderTimeline } from '../types';

export const orderService = {
  // Get user's orders
  async getOrders(page = 1, perPage = 10) {
    const response = await api.get('/user/orders', {
      params: { page, per_page: perPage },
    });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  // Create order from cart
  async createOrder(data: CreateOrderData): Promise<Order> {
    const response = await api.post('/user/orders', data);
    return response.data.data;
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order> {
    const response = await api.get(`/user/orders/${orderId}`);
    return response.data.data;
  },

  // Get order by order number
  async getOrderByNumber(orderNumber: string): Promise<Order> {
    const response = await api.get(`/user/orders/number/${orderNumber}`);
    return response.data.data;
  },

  // Cancel order
  async cancelOrder(orderId: string, reason?: string) {
    const response = await api.post(`/user/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data;
  },

  // Track order status
  async trackOrder(orderNumber: string): Promise<{
    order_number: string;
    status: string;
    payment_status: string;
    created_at: string;
    timeline: OrderTimeline[];
  }> {
    const response = await api.get(`/user/orders/track/${orderNumber}`);
    return response.data.data;
  },
};
