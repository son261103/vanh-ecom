import { create } from 'zustand';
import type { Order, CreateOrderData, PaginationMeta } from '../types';
import { orderService } from '../services/orderService';
import toast from 'react-hot-toast';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOrders: (page?: number, perPage?: number) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<void>;
  fetchOrderByNumber: (orderNumber: string) => Promise<void>;
  createOrder: (data: CreateOrderData) => Promise<Order | null>;
  cancelOrder: (orderId: string, reason?: string) => Promise<boolean>;
  trackOrder: (orderNumber: string) => Promise<any>;
  clearCurrentOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  currentOrder: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchOrders: async (page = 1, perPage = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderService.getOrders(page, perPage);
      set({
        orders: response.data,
        pagination: response.meta,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to load orders');
    }
  },

  fetchOrderById: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      const order = await orderService.getOrderById(orderId);
      set({ currentOrder: order, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to load order');
    }
  },

  fetchOrderByNumber: async (orderNumber: string) => {
    set({ isLoading: true, error: null });
    try {
      const order = await orderService.getOrderByNumber(orderNumber);
      set({ currentOrder: order, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Order not found');
    }
  },

  createOrder: async (data: CreateOrderData) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Creating order with data:', data);
      const order = await orderService.createOrder(data);
      console.log('Order created successfully:', order);
      set({ currentOrder: order, isLoading: false });
      toast.success('Order created successfully');
      return order;
    } catch (error: any) {
      console.error('Order creation failed:', error.response?.data || error.message);
      set({ error: error.message, isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to create order');
      return null;
    }
  },

  cancelOrder: async (orderId: string, reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      await orderService.cancelOrder(orderId, reason);
      set({ isLoading: false });
      toast.success('Order cancelled successfully');
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to cancel order');
      return false;
    }
  },

  trackOrder: async (orderNumber: string) => {
    set({ isLoading: true, error: null });
    try {
      const tracking = await orderService.trackOrder(orderNumber);
      set({ isLoading: false });
      return tracking;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to track order');
      return null;
    }
  },

  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },
}));
