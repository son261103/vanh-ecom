import { create } from 'zustand';
import type { User, LoginCredentials, RegisterData } from '../types';
import { authService } from '../services/authService';
import { showToast, getErrorMessage } from '../utils/toast';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login(credentials);
      
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      showToast.success(`Chào mừng ${response.user.name}!`);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      showToast.error(errorMessage);
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.register(data);
      
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      showToast.success('Đăng ký thành công! Chào mừng bạn đến với Vanh E-Commerce');
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      set({
        error: errorMessage,
        isLoading: false,
      });
      showToast.error(errorMessage);
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      showToast.success('Đã đăng xuất thành công!');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user');
    
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }

    // If we have both token and user in localStorage, set them immediately
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        set({
          user,
          token,
          isAuthenticated: true,
        });
      } catch (e) {
        // Invalid user data, clear everything
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        set({ isAuthenticated: false, user: null, token: null });
        return;
      }
    }

    // Verify token is still valid by fetching current user
    try {
      const user = await authService.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(user));
      set({
        user,
        token,
        isAuthenticated: true,
      });
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  updateUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  clearError: () => set({ error: null }),
}));
