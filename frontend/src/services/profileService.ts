import api from './api';
import type { User } from '../types';

export const profileService = {
  // Get user profile
  async getProfile() {
    const response = await api.get('/user/profile');
    return response.data.data;
  },

  // Update user profile
  async updateProfile(data: { full_name?: string; phone?: string }): Promise<User> {
    const response = await api.put('/user/profile', data);
    return response.data.data.profile;
  },

  // Change password
  async changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) {
    const response = await api.post('/user/profile/change-password', data);
    return response.data;
  },

  // Get order history
  async getOrderHistory(page = 1, perPage = 10) {
    const response = await api.get('/user/profile/order-history', {
      params: { page, per_page: perPage },
    });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  // Get favorite categories
  async getFavoriteCategories() {
    const response = await api.get('/user/profile/favorite-categories');
    return response.data.data;
  },

  // Delete account
  async deleteAccount(password: string, confirmation: string) {
    const response = await api.delete('/user/profile/delete-account', {
      data: { password, confirmation },
    });
    return response.data;
  },
};
