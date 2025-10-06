import api from './api';
import type { User } from '../types';

export interface UserFilters {
  search?: string;
  role?: 'customer' | 'admin';
  is_active?: boolean;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: 'customer' | 'admin';
  is_active?: boolean;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  full_name?: string;
  phone?: string;
  role?: 'customer' | 'admin';
  is_active?: boolean;
}

export const adminUserService = {
  // Get all users
  async getUsers(filters: UserFilters = {}) {
    const response = await api.get('/admin/users', { params: filters });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  // Get user by ID
  async getUserById(userId: string) {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  // Create new user
  async createUser(data: CreateUserData): Promise<User> {
    const response = await api.post('/admin/users', data);
    return response.data.data;
  },

  // Update user
  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data.data;
  },

  // Delete user
  async deleteUser(userId: string) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Toggle user status
  async toggleStatus(userId: string): Promise<User> {
    const response = await api.post(`/admin/users/${userId}/toggle-status`);
    return response.data.data;
  },

  // Reset user password
  async resetPassword(userId: string, password: string) {
    const response = await api.post(`/admin/users/${userId}/reset-password`, {
      password,
      password_confirmation: password,
    });
    return response.data;
  },

  // Get user statistics
  async getStats() {
    const response = await api.get('/admin/users/stats');
    return response.data.data;
  },

  // Get top customers
  async getTopCustomers(limit = 10) {
    const response = await api.get('/admin/users/top-customers', {
      params: { limit },
    });
    return response.data.data;
  },

  // Search users
  async searchUsers(query: string) {
    const response = await api.get('/admin/users/search', {
      params: { q: query },
    });
    return response.data.data;
  },
};
