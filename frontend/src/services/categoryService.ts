import api from './api';
import type { Category } from '../types';

export const categoryService = {
  // Public endpoints
  async getPublicCategories(): Promise<Category[]> {
    const response = await api.get<{ success: boolean; data: Category[] }>('/public/categories');
    return response.data.data;
  },

  async getCategoryProducts(slug: string, filters?: any): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get(`/public/categories/${slug}/products?${params.toString()}`);
    return response.data;
  },

  // Admin endpoints
  async getAdminCategories(params?: any): Promise<{ data: Category[]; meta?: any }> {
    const response = await api.get<{ success: boolean; data: Category[]; meta?: any }>('/admin/categories', { params });
    return { data: response.data.data, meta: response.data.meta };
  },

  async getAdminCategory(id: string): Promise<Category> {
    const response = await api.get<{ success: boolean; data: Category }>(`/admin/categories/${id}`);
    return response.data.data;
  },

  async createCategory(data: Partial<Category> & { image?: File }): Promise<Category> {
    const formData = new FormData();
    
    // Add regular fields
    if (data.name) formData.append('name', data.name);
    if (data.slug) formData.append('slug', data.slug);
    if (data.description) formData.append('description', data.description);
    if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
    if (data.image) formData.append('image', data.image);
    
    const response = await api.post<{ success: boolean; data: Category }>('/admin/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async updateCategory(id: string, data: Partial<Category> & { image?: File }): Promise<Category> {
    const formData = new FormData();
    
    // Add regular fields
    if (data.name) formData.append('name', data.name);
    if (data.slug) formData.append('slug', data.slug);
    if (data.description !== undefined) formData.append('description', data.description || '');
    if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
    if (data.image) formData.append('image', data.image);
    
    // Laravel doesn't support PUT with FormData, use POST with _method
    formData.append('_method', 'PUT');
    
    const response = await api.post<{ success: boolean; data: Category }>(`/admin/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/admin/categories/${id}`);
  },

  async toggleCategoryStatus(id: string): Promise<Category> {
    const response = await api.post<{ success: boolean; data: Category }>(`/admin/categories/${id}/toggle-status`);
    return response.data.data;
  },

  async getOptions(): Promise<Array<{ id: string; name: string }>> {
    const response = await api.get<{ success: boolean; data: Array<{ id: string; name: string }> }>('/admin/categories/options');
    return response.data.data;
  },
};
