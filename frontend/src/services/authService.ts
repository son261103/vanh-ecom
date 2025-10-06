import api from './api';
import type { LoginCredentials, RegisterData, AuthResponse, ForgotPasswordData, ResetPasswordData, User } from '../types';

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', credentials);
    return response.data.data;
  },

  // Register
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', data);
    return response.data.data;
  },

  // Logout
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ success: boolean; data: { user: User } }>('/auth/me');
    return response.data.data.user;
  },

  // Forgot password
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  // Reset password
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },

  // Verify email
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Resend verification email
  async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/resend-verification');
    return response.data;
  },
};
