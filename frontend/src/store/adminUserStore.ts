import { create } from 'zustand';
import type { User } from '../types';
import { adminUserService, type UserFilters, type CreateUserData, type UpdateUserData } from '../services/adminUserService';

interface AdminUserState {
  users: User[];
  currentUser: User | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
  filters: UserFilters;
  isLoading: boolean;
  error: string | null;
  stats: any;

  // Actions
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  createUser: (data: CreateUserData) => Promise<User>;
  updateUser: (id: string, data: UpdateUserData) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  resetUserPassword: (id: string, password: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: Partial<UserFilters>) => void;
  clearError: () => void;
}

export const useAdminUserStore = create<AdminUserState>((set, get) => ({
  users: [],
  currentUser: null,
  pagination: null,
  filters: {
    page: 1,
    per_page: 10,
  },
  isLoading: false,
  error: null,
  stats: null,

  fetchUsers: async (filters) => {
    try {
      set({ isLoading: true, error: null });
      const finalFilters = filters || get().filters;
      const response = await adminUserService.getUsers(finalFilters);
      set({
        users: response.data,
        pagination: response.meta,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Không thể tải danh sách người dùng',
        isLoading: false,
      });
    }
  },

  fetchUserById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const user = await adminUserService.getUserById(id);
      set({ currentUser: user, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Không thể tải thông tin người dùng',
        isLoading: false,
      });
    }
  },

  createUser: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const user = await adminUserService.createUser(data);
      const { users } = get();
      set({
        users: [user, ...users],
        isLoading: false,
      });
      return user;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Không thể tạo người dùng',
        isLoading: false,
      });
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const user = await adminUserService.updateUser(id, data);
      const { users } = get();
      set({
        users: users.map((u) => (u.id === id ? user : u)),
        currentUser: user,
        isLoading: false,
      });
      return user;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Không thể cập nhật người dùng',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await adminUserService.deleteUser(id);
      const { users } = get();
      set({
        users: users.filter((u) => u.id !== id),
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Không thể xóa người dùng',
        isLoading: false,
      });
      throw error;
    }
  },

  toggleUserStatus: async (id) => {
    try {
      const user = await adminUserService.toggleStatus(id);
      const { users } = get();
      set({
        users: users.map((u) => (u.id === id ? user : u)),
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Không thể thay đổi trạng thái người dùng',
      });
      throw error;
    }
  },

  resetUserPassword: async (id, password) => {
    try {
      set({ isLoading: true, error: null });
      await adminUserService.resetPassword(id, password);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Không thể đặt lại mật khẩu',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchStats: async () => {
    try {
      const stats = await adminUserService.getStats();
      set({ stats });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Không thể tải thống kê',
      });
    }
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearError: () => set({ error: null }),
}));
