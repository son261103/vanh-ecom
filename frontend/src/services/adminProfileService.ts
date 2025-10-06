import api from './api';
import type { User } from '../types';

export const adminProfileService = {
  // Get admin profile (using /auth/me endpoint)
  async getProfile(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  // Update admin profile
  async updateProfile(data: { full_name?: string; phone?: string }): Promise<User> {
    const response = await api.put('/user/profile', data);
    return response.data.data;
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
};
