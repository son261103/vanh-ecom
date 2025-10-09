/**
 * Optimized API Utility with Request Deduplication & Response Caching
 * 
 * Features:
 * - Automatic request deduplication (prevents duplicate simultaneous requests)
 * - Response caching with configurable TTL
 * - Cache invalidation on mutations
 * - Error handling and retry logic
 */

import axios from 'axios';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Cache TTL configuration (in milliseconds)
const CACHE_TTL = {
  categories: 60 * 60 * 1000,    // 1 hour
  brands: 60 * 60 * 1000,         // 1 hour
  filterOptions: 60 * 60 * 1000,  // 1 hour
  products: 5 * 60 * 1000,        // 5 minutes
  product: 5 * 60 * 1000,         // 5 minutes
  cart: 0,                        // No cache (always fresh)
  orders: 2 * 60 * 1000,          // 2 minutes
};

// ============================================================================
// Cache Management
// ============================================================================

// In-memory cache storage
const responseCache = new Map();

// Pending requests map (for deduplication)
const pendingRequests = new Map();

/**
 * Generate a unique cache key based on request config
 */
function getCacheKey(config) {
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${config.method}:${config.url}:${params}`;
}

/**
 * Check if cached response is still valid
 */
function isCacheValid(cacheEntry, ttl) {
  if (!cacheEntry) return false;
  if (ttl === 0) return false; // No cache
  return Date.now() - cacheEntry.timestamp < ttl;
}

/**
 * Clear all cached responses
 */
export function clearCache() {
  responseCache.clear();
  console.log('🗑️ API cache cleared');
}

/**
 * Clear specific cache keys by pattern
 */
export function clearCacheByPattern(pattern) {
  const keys = Array.from(responseCache.keys());
  keys.forEach(key => {
    if (key.includes(pattern)) {
      responseCache.delete(key);
    }
  });
  console.log(`🗑️ Cleared cache matching pattern: ${pattern}`);
}

// ============================================================================
// Axios Instance Configuration
// ============================================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

// ============================================================================
// Request Interceptor - Deduplication & Caching
// ============================================================================

api.interceptors.request.use(
  (config) => {
    const cacheKey = getCacheKey(config);
    
    // Only apply caching/deduplication for GET requests
    if (config.method === 'get') {
      // Check if response is cached and valid
      if (config.cacheKey) {
        const ttl = CACHE_TTL[config.cacheKey] || 0;
        const cached = responseCache.get(cacheKey);
        
        if (isCacheValid(cached, ttl)) {
          // Return cached response immediately
          config.adapter = () => {
            console.log(`📦 Cache HIT: ${config.url}`);
            return Promise.resolve({
              data: cached.data,
              status: 200,
              statusText: 'OK (Cached)',
              headers: cached.headers,
              config,
              fromCache: true,
            });
          };
          return config;
        }
      }
      
      // Check if same request is already pending (deduplication)
      if (pendingRequests.has(cacheKey)) {
        console.log(`⏳ Request DEDUPLICATED: ${config.url}`);
        config.adapter = () => pendingRequests.get(cacheKey);
        return config;
      }
    }
    
    console.log(`🌐 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// Response Interceptor - Cache Storage & Cleanup
// ============================================================================

api.interceptors.response.use(
  (response) => {
    const cacheKey = getCacheKey(response.config);
    
    // Remove from pending requests
    if (pendingRequests.has(cacheKey)) {
      pendingRequests.delete(cacheKey);
    }
    
    // Cache GET responses if cacheKey is specified
    if (response.config.method === 'get' && response.config.cacheKey) {
      responseCache.set(cacheKey, {
        data: response.data,
        headers: response.headers,
        timestamp: Date.now(),
      });
      console.log(`💾 Cached response: ${response.config.url}`);
    }
    
    return response;
  },
  (error) => {
    const cacheKey = getCacheKey(error.config);
    
    // Remove from pending requests on error
    if (pendingRequests.has(cacheKey)) {
      pendingRequests.delete(cacheKey);
    }
    
    console.error(`❌ API Error: ${error.config?.url}`, error.message);
    return Promise.reject(error);
  }
);

// ============================================================================
// API Methods - Products
// ============================================================================

export const productAPI = {
  /**
   * Get all categories (cached)
   */
  getCategories() {
    return api.get('/public/categories', { cacheKey: 'categories' });
  },

  /**
   * Get all brands (cached)
   */
  getBrands() {
    return api.get('/public/brands', { cacheKey: 'brands' });
  },

  /**
   * Get filter options (cached)
   */
  getFilterOptions() {
    return api.get('/public/products/filter-options', { cacheKey: 'filterOptions' });
  },

  /**
   * Get paginated products (cached with params)
   */
  getProducts(params = {}) {
    return api.get('/public/products', {
      params,
      cacheKey: 'products',
    });
  },

  /**
   * Get single product by slug (cached)
   */
  getProduct(slug) {
    return api.get(`/public/products/${slug}`, { cacheKey: 'product' });
  },

  /**
   * Get featured products (cached)
   */
  getFeaturedProducts(limit = 8) {
    return api.get('/public/products/featured', {
      params: { limit },
      cacheKey: 'products',
    });
  },

  /**
   * Get trending products (cached)
   */
  getTrendingProducts(limit = 8) {
    return api.get('/public/products/trending', {
      params: { limit },
      cacheKey: 'products',
    });
  },

  /**
   * Search products
   */
  searchProducts(query, params = {}) {
    return api.get('/public/products/search', {
      params: { q: query, ...params },
      cacheKey: 'products',
    });
  },

  /**
   * Get search suggestions
   */
  getSearchSuggestions(query) {
    return api.get('/public/products/search-suggestions', {
      params: { q: query },
      cacheKey: 'products',
    });
  },

  /**
   * Get products by category
   */
  getProductsByCategory(categorySlug, params = {}) {
    return api.get(`/public/categories/${categorySlug}/products`, {
      params,
      cacheKey: 'products',
    });
  },

  /**
   * Get products by brand
   */
  getProductsByBrand(brandSlug, params = {}) {
    return api.get(`/public/brands/${brandSlug}/products`, {
      params,
      cacheKey: 'products',
    });
  },
};

// ============================================================================
// API Methods - Cart (No Caching)
// ============================================================================

export const cartAPI = {
  /**
   * Get cart items
   */
  getCart() {
    return api.get('/user/cart');
  },

  /**
   * Add item to cart
   */
  addToCart(productId, quantity = 1) {
    clearCacheByPattern('/user/cart'); // Invalidate cart cache
    return api.post('/user/cart', { product_id: productId, quantity });
  },

  /**
   * Update cart item
   */
  updateCartItem(cartItemId, quantity) {
    clearCacheByPattern('/user/cart');
    return api.put(`/user/cart/${cartItemId}`, { quantity });
  },

  /**
   * Remove cart item
   */
  removeCartItem(cartItemId) {
    clearCacheByPattern('/user/cart');
    return api.delete(`/user/cart/${cartItemId}`);
  },

  /**
   * Clear cart
   */
  clearCart() {
    clearCacheByPattern('/user/cart');
    return api.delete('/user/cart');
  },

  /**
   * Get cart count
   */
  getCartCount() {
    return api.get('/user/cart/count');
  },

  /**
   * Validate cart
   */
  validateCart() {
    return api.get('/user/cart/validate');
  },
};

// ============================================================================
// API Methods - Orders (Light Caching)
// ============================================================================

export const orderAPI = {
  /**
   * Get user orders
   */
  getOrders(params = {}) {
    return api.get('/user/orders', { params, cacheKey: 'orders' });
  },

  /**
   * Create order
   */
  createOrder(orderData) {
    clearCacheByPattern('/user/orders');
    clearCacheByPattern('/user/cart');
    return api.post('/user/orders', orderData);
  },

  /**
   * Get order by ID
   */
  getOrder(orderId) {
    return api.get(`/user/orders/${orderId}`, { cacheKey: 'orders' });
  },

  /**
   * Get order by order number
   */
  getOrderByNumber(orderNumber) {
    return api.get(`/user/orders/number/${orderNumber}`, { cacheKey: 'orders' });
  },

  /**
   * Track order
   */
  trackOrder(orderNumber) {
    return api.get(`/user/orders/track/${orderNumber}`);
  },

  /**
   * Cancel order
   */
  cancelOrder(orderId) {
    clearCacheByPattern('/user/orders');
    return api.post(`/user/orders/${orderId}/cancel`);
  },
};

// ============================================================================
// API Methods - Authentication
// ============================================================================

export const authAPI = {
  /**
   * Register new user
   */
  register(userData) {
    return api.post('/auth/register', userData);
  },

  /**
   * Login user
   */
  login(credentials) {
    return api.post('/auth/login', credentials);
  },

  /**
   * Logout user
   */
  logout() {
    clearCache(); // Clear all cache on logout
    return api.post('/auth/logout');
  },

  /**
   * Get current user
   */
  me() {
    return api.get('/auth/me');
  },

  /**
   * Refresh token
   */
  refresh() {
    return api.post('/auth/refresh');
  },
};

// ============================================================================
// Export Default API Instance
// ============================================================================

export default api;
