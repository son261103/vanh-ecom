export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  full_name?: string;
  role: 'admin' | 'customer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirmation: string;
  full_name?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}
