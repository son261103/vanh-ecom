import { api } from '../lib/axios';
import type { Order, OrderStatus, PaymentStatus, OrderStats, RevenueStats } from '../types';

export interface AdminOrderFilters {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export const adminOrderService = {
  // Get all orders with filters
  async getOrders(filters: AdminOrderFilters = {}) {
    const response = await api.get('/admin/orders', { params: filters });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order> {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data.data;
  },

  // Update order status
  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const response = await api.post(`/admin/orders/${orderId}/update-status`, {
      status,
    });
    return response.data.data;
  },

  // Update payment status
  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order> {
    const response = await api.post(`/admin/orders/${orderId}/update-payment-status`, {
      payment_status: paymentStatus,
    });
    return response.data.data;
  },

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const response = await api.post(`/admin/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data.data;
  },

  // Get order statistics
  async getStats(): Promise<OrderStats> {
    const response = await api.get('/admin/orders/stats');
    return response.data.data;
  },

  // Get revenue statistics
  async getRevenueStats(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<RevenueStats> {
    const response = await api.get('/admin/orders/revenue-stats', {
      params: { period },
    });
    return response.data.data;
  },
};
