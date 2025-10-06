import api from './api';
import type { Brand } from '../types';

export const brandService = {
  // Public endpoints
  async getPublicBrands(): Promise<Brand[]> {
    const response = await api.get<{ success: boolean; data: Brand[] }>('/public/brands');
    return response.data.data;
  },

  async getBrandProducts(slug: string, filters?: any): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get(`/public/brands/${slug}/products?${params.toString()}`);
    return response.data;
  },

  // Admin endpoints
  async getAdminBrands(params?: any): Promise<{ data: Brand[]; meta?: any }> {
    const response = await api.get<{ success: boolean; data: Brand[]; meta?: any }>('/admin/brands', { params });
    return { data: response.data.data, meta: response.data.meta };
  },

  async getAdminBrand(id: string): Promise<Brand> {
    const response = await api.get<{ success: boolean; data: Brand }>(`/admin/brands/${id}`);
    return response.data.data;
  },

  async createBrand(data: Partial<Brand>): Promise<Brand> {
    const response = await api.post<{ success: boolean; data: Brand }>('/admin/brands', data);
    return response.data.data;
  },

  async updateBrand(id: string, data: Partial<Brand>): Promise<Brand> {
    const response = await api.put<{ success: boolean; data: Brand }>(`/admin/brands/${id}`, data);
    return response.data.data;
  },

  async deleteBrand(id: string): Promise<void> {
    await api.delete(`/admin/brands/${id}`);
  },

  async toggleBrandStatus(id: string): Promise<Brand> {
    const response = await api.post<{ success: boolean; data: Brand }>(`/admin/brands/${id}/toggle-status`);
    return response.data.data;
  },
};
