import { create } from 'zustand';
import type { Category, Brand } from '../types';
import { categoryService } from '../services/categoryService';
import { brandService } from '../services/brandService';

interface CatalogState {
  categories: Category[];
  brands: Brand[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: (isAdmin?: boolean) => Promise<void>;
  fetchBrands: (isAdmin?: boolean) => Promise<void>;
  createCategory: (data: Partial<Category>) => Promise<Category>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  toggleCategoryStatus: (id: string) => Promise<void>;
  createBrand: (data: Partial<Brand>) => Promise<Brand>;
  updateBrand: (id: string, data: Partial<Brand>) => Promise<Brand>;
  deleteBrand: (id: string) => Promise<void>;
  toggleBrandStatus: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  categories: [],
  brands: [],
  isLoading: false,
  error: null,

  fetchCategories: async (isAdmin = false) => {
    try {
      set({ isLoading: true, error: null });
      const categories = isAdmin
        ? (await categoryService.getAdminCategories()).data
        : await categoryService.getPublicCategories();
      set({ categories, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch categories',
        isLoading: false,
      });
    }
  },

  fetchBrands: async (isAdmin = false) => {
    try {
      set({ isLoading: true, error: null });
      const brands = isAdmin
        ? (await brandService.getAdminBrands()).data
        : await brandService.getPublicBrands();
      set({ brands, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch brands',
        isLoading: false,
      });
    }
  },

  createCategory: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const category = await categoryService.createCategory(data);
      const { categories } = get();
      set({
        categories: [...categories, category],
        isLoading: false,
      });
      return category;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create category',
        isLoading: false,
      });
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const category = await categoryService.updateCategory(id, data);
      const { categories } = get();
      set({
        categories: categories.map((c) => (c.id === id ? category : c)),
        isLoading: false,
      });
      return category;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update category',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await categoryService.deleteCategory(id);
      const { categories } = get();
      set({
        categories: categories.filter((c) => c.id !== id),
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete category',
        isLoading: false,
      });
      throw error;
    }
  },

  toggleCategoryStatus: async (id) => {
    try {
      const category = await categoryService.toggleCategoryStatus(id);
      const { categories } = get();
      set({
        categories: categories.map((c) => (c.id === id ? category : c)),
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to toggle category status',
      });
      throw error;
    }
  },

  createBrand: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const brand = await brandService.createBrand(data);
      const { brands } = get();
      set({
        brands: [...brands, brand],
        isLoading: false,
      });
      return brand;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create brand',
        isLoading: false,
      });
      throw error;
    }
  },

  updateBrand: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const brand = await brandService.updateBrand(id, data);
      const { brands } = get();
      set({
        brands: brands.map((b) => (b.id === id ? brand : b)),
        isLoading: false,
      });
      return brand;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update brand',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteBrand: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await brandService.deleteBrand(id);
      const { brands } = get();
      set({
        brands: brands.filter((b) => b.id !== id),
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete brand',
        isLoading: false,
      });
      throw error;
    }
  },

  toggleBrandStatus: async (id) => {
    try {
      const brand = await brandService.toggleBrandStatus(id);
      const { brands } = get();
      set({
        brands: brands.map((b) => (b.id === id ? brand : b)),
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to toggle brand status',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
