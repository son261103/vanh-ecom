export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  brand_id: string;
  category_id: string;
  brand?: Brand;
  category?: Category;
  images?: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  category_id?: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  brand_id?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  sort_by?: 'name' | 'price' | 'created_at';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  meta: PaginationMeta;
}

export interface ProductDetailResponse {
  success: boolean;
  data: {
    product: Product;
    related_products: Product[];
  };
}

export interface ProductCreateData {
  name: string;
  description: string;
  sku: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  brand_id: string;
  category_id: string;
  is_featured?: boolean;
  is_active?: boolean;
}

export interface ProductUpdateData extends Partial<ProductCreateData> {}

export interface ProductStats {
  total_products: number;
  active_products: number;
  out_of_stock: number;
  low_stock: number;
  featured_products: number;
  total_value: number;
}

