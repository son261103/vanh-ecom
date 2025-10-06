import api from './api';
import type {
  Product,
  ProductFilters,
  ProductListResponse,
  ProductDetailResponse,
  ProductCreateData,
  ProductUpdateData,
  ProductStats,
} from '../types';

export const productService = {
  // Public endpoints
  async getPublicProducts(filters?: ProductFilters): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get<ProductListResponse>(`/public/products?${params.toString()}`);
    return response.data;
  },

  async getPublicProductBySlug(slug: string): Promise<ProductDetailResponse> {
    const response = await api.get<ProductDetailResponse>(`/public/products/${slug}`);
    return response.data;
  },

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const response = await api.get<{ success: boolean; data: Product[] }>('/public/products/featured', {
      params: { limit },
    });
    return response.data.data;
  },

  async getTrendingProducts(limit: number = 8): Promise<Product[]> {
    const response = await api.get<{ success: boolean; data: Product[] }>('/public/products/trending', {
      params: { limit },
    });
    return response.data.data;
  },

  async searchProducts(query: string, filters?: ProductFilters): Promise<ProductListResponse> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get<ProductListResponse>(`/public/products/search?${params.toString()}`);
    return response.data;
  },

  async getSearchSuggestions(query: string): Promise<{
    products: Product[];
    brands: any[];
    categories: any[];
  }> {
    const response = await api.get<{ success: boolean; data: any }>('/public/products/search-suggestions', {
      params: { q: query },
    });
    return response.data.data;
  },

  // Admin endpoints
  async getAdminProducts(filters?: ProductFilters): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get<ProductListResponse>(`/admin/products?${params.toString()}`);
    return response.data;
  },

  async getAdminProduct(id: string): Promise<Product> {
    const response = await api.get<{ success: boolean; data: Product }>(`/admin/products/${id}`);
    return response.data.data;
  },

  async createProduct(data: ProductCreateData & { images?: File[] }): Promise<Product> {
    const formData = new FormData();
    
    // Add regular fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images' && value !== undefined && value !== null) {
        // Convert boolean to '1' or '0' for Laravel
        if (typeof value === 'boolean') {
          formData.append(key, value ? '1' : '0');
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // Add images if provided
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }
    
    const response = await api.post<{ success: boolean; data: Product }>('/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async updateProduct(id: string, data: ProductUpdateData & { images?: File[] }): Promise<Product> {
    const formData = new FormData();
    
    // Add regular fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images' && value !== undefined && value !== null) {
        // Convert boolean to '1' or '0' for Laravel
        if (typeof value === 'boolean') {
          formData.append(key, value ? '1' : '0');
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // Add images if provided
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }
    
    // Use POST with _method for Laravel
    formData.append('_method', 'PUT');
    
    const response = await api.post<{ success: boolean; data: Product }>(`/admin/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/admin/products/${id}`);
  },

  async toggleProductStatus(id: string): Promise<Product> {
    const response = await api.post<{ success: boolean; data: Product }>(`/admin/products/${id}/toggle-status`);
    return response.data.data;
  },

  async toggleProductFeatured(id: string): Promise<Product> {
    const response = await api.post<{ success: boolean; data: Product }>(`/admin/products/${id}/toggle-featured`);
    return response.data.data;
  },

  async updateProductStock(id: string, quantity: number, operation: 'set' | 'add' | 'subtract' = 'set'): Promise<Product> {
    const response = await api.post<{ success: boolean; data: Product }>(`/admin/products/${id}/update-stock`, {
      quantity,
      operation,
    });
    return response.data.data;
  },

  async getProductStats(): Promise<ProductStats> {
    const response = await api.get<{ success: boolean; data: ProductStats }>('/admin/products/stats');
    return response.data.data;
  },
};
