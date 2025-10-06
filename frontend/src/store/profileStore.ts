import { create } from 'zustand';
import type { User } from '../types';
import { profileService } from '../services/profileService';

interface ProfileState {
  profile: User | null;
  orderHistory: any[];
  orderPagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
  favoriteCategories: any[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { full_name?: string; phone?: string }) => Promise<void>;
  changePassword: (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  fetchOrderHistory: (page?: number, perPage?: number) => Promise<void>;
  fetchFavoriteCategories: () => Promise<void>;
  deleteAccount: (password: string, confirmation: string) => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  orderHistory: [],
  orderPagination: null,
  favoriteCategories: [],
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const profile = await profileService.getProfile();
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Không thể tải thông tin profile',
        isLoading: false,
      });
    }
  },

  updateProfile: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const profile = await profileService.updateProfile(data);
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Không thể cập nhật profile',
        isLoading: false,
      });
      throw error;
    }
  },

  changePassword: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await profileService.changePassword(data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Không thể thay đổi mật khẩu',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchOrderHistory: async (page = 1, perPage = 10) => {
    try {
      set({ isLoading: true, error: null });
      const response = await profileService.getOrderHistory(page, perPage);
      set({
        orderHistory: response.data,
        orderPagination: response.meta,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Không thể tải lịch sử đơn hàng',
        isLoading: false,
      });
    }
  },

  fetchFavoriteCategories: async () => {
    try {
      const categories = await profileService.getFavoriteCategories();
      set({ favoriteCategories: categories });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Không thể tải danh mục yêu thích',
      });
    }
  },

  deleteAccount: async (password, confirmation) => {
    try {
      set({ isLoading: true, error: null });
      await profileService.deleteAccount(password, confirmation);
      set({ profile: null, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Không thể xóa tài khoản',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
