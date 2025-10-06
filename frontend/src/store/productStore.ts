import { create } from 'zustand';
import type { Product, ProductFilters, PaginationMeta } from '../types';
import { productService } from '../services/productService';

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  relatedProducts: Product[];
  featuredProducts: Product[];
  trendingProducts: Product[];
  filters: ProductFilters;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setFilters: (filters: ProductFilters) => void;
  fetchProducts: (isAdmin?: boolean) => Promise<void>;
  fetchProductBySlug: (slug: string) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  fetchTrendingProducts: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  createProduct: (data: any) => Promise<Product>;
  updateProduct: (id: string, data: any) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductStatus: (id: string) => Promise<void>;
  toggleProductFeatured: (id: string) => Promise<void>;
  updateProductStock: (id: string, quantity: number, operation?: 'set' | 'add' | 'subtract') => Promise<void>;
  clearError: () => void;
  clearCurrentProduct: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  currentProduct: null,
  relatedProducts: [],
  featuredProducts: [],
  trendingProducts: [],
  filters: {},
  pagination: null,
  isLoading: false,
  error: null,

  setFilters: (filters) => {
    set({ filters });
  },

  fetchProducts: async (isAdmin = false) => {
    try {
      set({ isLoading: true, error: null });
      const { filters } = get();
      const response = isAdmin
        ? await productService.getAdminProducts(filters)
        : await productService.getPublicProducts(filters);
      set({
        products: response.data,
        pagination: response.meta,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch products',
        isLoading: false,
      });
    }
  },

  fetchProductBySlug: async (slug) => {
    try {
      set({ isLoading: true, error: null });
      const response = await productService.getPublicProductBySlug(slug);
      set({
        currentProduct: response.data.product,
        relatedProducts: response.data.related_products,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch product',
        isLoading: false,
      });
    }
  },

  fetchProductById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const product = await productService.getAdminProduct(id);
      set({
        currentProduct: product,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch product',
        isLoading: false,
      });
    }
  },

  fetchFeaturedProducts: async () => {
    try {
      const products = await productService.getFeaturedProducts();
      set({ featuredProducts: products });
    } catch (error: any) {
      console.error('Failed to fetch featured products:', error);
    }
  },

  fetchTrendingProducts: async () => {
    try {
      const products = await productService.getTrendingProducts();
      set({ trendingProducts: products });
    } catch (error: any) {
      console.error('Failed to fetch trending products:', error);
    }
  },

  searchProducts: async (query) => {
    try {
      set({ isLoading: true, error: null });
      const { filters } = get();
      const response = await productService.searchProducts(query, filters);
      set({
        products: response.data,
        pagination: response.meta,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to search products',
        isLoading: false,
      });
    }
  },

  createProduct: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const product = await productService.createProduct(data);
      set({ isLoading: false });
      return product;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create product',
        isLoading: false,
      });
      throw error;
    }
  },

  updateProduct: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const product = await productService.updateProduct(id, data);
      set({ isLoading: false });
      return product;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update product',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await productService.deleteProduct(id);
      const { products } = get();
      set({
        products: products.filter((p) => p.id !== id),
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete product',
        isLoading: false,
      });
      throw error;
    }
  },

  toggleProductStatus: async (id) => {
    try {
      const product = await productService.toggleProductStatus(id);
      const { products } = get();
      set({
        products: products.map((p) => (p.id === id ? product : p)),
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to toggle product status',
      });
      throw error;
    }
  },

  toggleProductFeatured: async (id) => {
    try {
      const product = await productService.toggleProductFeatured(id);
      const { products } = get();
      set({
        products: products.map((p) => (p.id === id ? product : p)),
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to toggle featured status',
      });
      throw error;
    }
  },

  updateProductStock: async (id, quantity, operation = 'set') => {
    try {
      const product = await productService.updateProductStock(id, quantity, operation);
      const { products } = get();
      set({
        products: products.map((p) => (p.id === id ? product : p)),
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update stock',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentProduct: () => set({ currentProduct: null, relatedProducts: [] }),
}));
