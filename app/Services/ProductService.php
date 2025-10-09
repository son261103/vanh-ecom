<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductService
{
    /**
     * Get paginated products with optional filters.
     *
     * @param array<string, mixed> $filters Array of filter options
     * @param int $perPage Number of items per page
     * @param bool $includeImages Whether to include product images (default: false for list views)
     * @return LengthAwarePaginator<Product>
     */
    public function getPaginatedProducts(
        array $filters = [],
        int $perPage = 15,
        bool $includeImages = false
    ): LengthAwarePaginator {
        $query = Product::query()
            ->select([
                'products.id',
                'products.name',
                'products.slug',
                'products.description',
                'products.sku',
                'products.price',
                'products.sale_price',
                'products.stock_quantity',
                'products.category_id',
                'products.brand_id',
                'products.is_active',
                'products.is_featured',
                'products.created_at',
                'products.updated_at',
            ])
            ->where('products.is_active', true)
            ->with([
                'brand:id,name,slug',
                'category:id,name,slug',
            ]);

        // Always load at least first image for thumbnails (optimized)
        // Load all images only for detail views
        if ($includeImages) {
            // Detail view: Load all images
            $query->with('images:id,product_id,url,alt_text,sort_order');
        } else {
            // List view: Load only first image (primary) based on sort_order
            $query->with([
                'images' => function ($q) {
                    $q->select('id', 'product_id', 'url', 'alt_text', 'sort_order')
                      ->orderBy('sort_order')
                      ->limit(1);  // Only get first image for list view
                }
            ]);
        }

        // Apply filters
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhereHas('brand', function ($brandQuery) use ($search) {
                      $brandQuery->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('category', function ($categoryQuery) use ($search) {
                      $categoryQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['brand_id'])) {
            $query->where('brand_id', $filters['brand_id']);
        }

        if (!empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (!empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        if (!empty($filters['is_featured'])) {
            $query->where('is_featured', true);
        }

        if (!empty($filters['in_stock'])) {
            $query->where('stock_quantity', '>', 0);
        }

        // Apply additional filters
        if (!empty($filters['tags'])) {
            $tags = is_array($filters['tags']) ? $filters['tags'] : explode(',', $filters['tags']);
            $query->where(function ($q) use ($tags) {
                foreach ($tags as $tag) {
                    $q->orWhere('description', 'like', "%{$tag}%")
                      ->orWhere('name', 'like', "%{$tag}%");
                }
            });
        }

        if (!empty($filters['price_range'])) {
            switch ($filters['price_range']) {
                case 'under_50':
                    $query->where('price', '<', 50);
                    break;
                case '50_100':
                    $query->whereBetween('price', [50, 100]);
                    break;
                case '100_200':
                    $query->whereBetween('price', [100, 200]);
                    break;
                case 'over_200':
                    $query->where('price', '>', 200);
                    break;
            }
        }

        if (!empty($filters['stock_status'])) {
            switch ($filters['stock_status']) {
                case 'in_stock':
                    $query->where('stock_quantity', '>', 0);
                    break;
                case 'low_stock':
                    $query->whereBetween('stock_quantity', [1, 10]);
                    break;
                case 'out_of_stock':
                    $query->where('stock_quantity', '=', 0);
                    break;
            }
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        $allowedSortFields = ['name', 'price', 'created_at', 'stock_quantity', 'popularity'];
        if (in_array($sortBy, $allowedSortFields)) {
            if ($sortBy === 'popularity') {
                // Sort by a combination of factors for popularity
                $query->orderByRaw('(is_featured * 2 + (stock_quantity > 0) + (price < 100)) DESC');
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }
        }

        return $query->paginate($perPage);
    }

    /**
     * Get featured products.
     */
    public function getFeaturedProducts(int $limit = 8): Collection
    {
        return Product::with(['brand', 'category', 'images'])
            ->where('is_active', true)
            ->where('is_featured', true)
            ->where('stock_quantity', '>', 0)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get related products based on category and brand.
     */
    public function getRelatedProducts(Product $product, int $limit = 4): Collection
    {
        return Product::with(['brand', 'category', 'images'])
            ->where('is_active', true)
            ->where('id', '!=', $product->id)
            ->where(function ($query) use ($product) {
                $query->where('category_id', $product->category_id)
                      ->orWhere('brand_id', $product->brand_id);
            })
            ->where('stock_quantity', '>', 0)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Create a new product.
     */
    public function createProduct(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            // Extract images if provided
            $images = $data['images'] ?? [];
            unset($data['images']);

            // Generate slug if not provided
            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            // Ensure slug is unique
            $data['slug'] = $this->generateUniqueSlug($data['slug']);

            $product = Product::create($data);

            // Handle image uploads
            if (!empty($images)) {
                $this->syncProductImages($product, $images);
            }

            return $product->load(['brand', 'category', 'images']);
        });
    }

    /**
     * Update an existing product.
     */
    public function updateProduct(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            // Extract images if provided
            $images = $data['images'] ?? null;
            unset($data['images']);

            // Generate slug if name is updated but slug is not provided
            if (isset($data['name']) && empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            // Ensure slug is unique (excluding current product)
            if (isset($data['slug'])) {
                $data['slug'] = $this->generateUniqueSlug($data['slug'], $product->id);
            }

            $product->update($data);

            // Handle image uploads if provided
            if ($images !== null) {
                $this->syncProductImages($product, $images);
            }

            return $product->load(['brand', 'category', 'images']);
        });
    }

    /**
     * Delete a product and its related data.
     */
    public function deleteProduct(Product $product): bool
    {
        return DB::transaction(function () use ($product) {
            // Delete product images
            $product->images()->delete();

            // Delete cart items containing this product
            $product->cartItems()->delete();

            // Note: We don't delete order items to maintain order history
            // Instead, we could mark the product as deleted or inactive

            return $product->delete();
        });
    }

    /**
     * Add images to a product.
     */
    public function addProductImages(Product $product, array $images): Collection
    {
        $productImages = collect();

        foreach ($images as $imageData) {
            $productImage = $product->images()->create([
                'image_url' => $imageData['url'],
                'alt_text' => $imageData['alt_text'] ?? $product->name,
                'sort_order' => $imageData['sort_order'] ?? 0,
                'is_primary' => $imageData['is_primary'] ?? false,
            ]);

            $productImages->push($productImage);
        }

        // Ensure only one primary image
        if ($productImages->where('is_primary', true)->count() > 1) {
            $product->images()->where('is_primary', true)->update(['is_primary' => false]);
            $productImages->first()->update(['is_primary' => true]);
        }

        return $productImages;
    }

    /**
     * Update product stock quantity.
     */
    public function updateStock(Product $product, int $quantity, string $operation = 'set'): Product
    {
        return DB::transaction(function () use ($product, $quantity, $operation) {
            switch ($operation) {
                case 'add':
                    $product->increment('stock_quantity', $quantity);
                    break;
                case 'subtract':
                    $product->decrement('stock_quantity', $quantity);
                    break;
                case 'set':
                default:
                    $product->update(['stock_quantity' => $quantity]);
                    break;
            }

            return $product->fresh();
        });
    }

    /**
     * Check if product is available for purchase.
     */
    public function isAvailable(Product $product, int $quantity = 1): bool
    {
        return $product->is_active && 
               $product->stock_quantity >= $quantity;
    }

    /**
     * Generate a unique slug for the product.
     */
    private function generateUniqueSlug(string $slug, ?string $excludeId = null): string
    {
        $originalSlug = $slug;
        $counter = 1;

        while (true) {
            $query = Product::where('slug', $slug);
            
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }

            if (!$query->exists()) {
                break;
            }

            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Get product statistics for admin dashboard.
     */
    public function getProductStats(): array
    {
        return [
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'featured_products' => Product::where('is_featured', true)->count(),
            'out_of_stock' => Product::where('stock_quantity', 0)->count(),
            'low_stock' => Product::where('stock_quantity', '>', 0)
                                 ->where('stock_quantity', '<=', 10)
                                 ->count(),
        ];
    }

    /**
     * Get advanced search suggestions.
     */
    public function getSearchSuggestions(string $query, int $limit = 5): array
    {
        if (strlen($query) < 2) {
            return [];
        }

        $products = Product::where('is_active', true)
            ->where('name', 'like', "%{$query}%")
            ->limit($limit)
            ->get(['id', 'name', 'slug']);

        $brands = \App\Models\Brand::where('is_active', true)
            ->where('name', 'like', "%{$query}%")
            ->limit($limit)
            ->get(['id', 'name', 'slug']);

        $categories = \App\Models\Category::where('is_active', true)
            ->where('name', 'like', "%{$query}%")
            ->limit($limit)
            ->get(['id', 'name', 'slug']);

        return [
            'products' => $products,
            'brands' => $brands,
            'categories' => $categories,
        ];
    }

    /**
     * Get filter options for advanced filtering.
     */
    public function getFilterOptions(): array
    {
        return [
            'price_ranges' => [
                ['value' => 'under_50', 'label' => 'Under $50'],
                ['value' => '50_100', 'label' => '$50 - $100'],
                ['value' => '100_200', 'label' => '$100 - $200'],
                ['value' => 'over_200', 'label' => 'Over $200'],
            ],
            'stock_status' => [
                ['value' => 'in_stock', 'label' => 'In Stock'],
                ['value' => 'low_stock', 'label' => 'Low Stock'],
                ['value' => 'out_of_stock', 'label' => 'Out of Stock'],
            ],
            'sort_options' => [
                ['value' => 'name:asc', 'label' => 'Name (A-Z)'],
                ['value' => 'name:desc', 'label' => 'Name (Z-A)'],
                ['value' => 'price:asc', 'label' => 'Price (Low to High)'],
                ['value' => 'price:desc', 'label' => 'Price (High to Low)'],
                ['value' => 'created_at:desc', 'label' => 'Newest First'],
                ['value' => 'created_at:asc', 'label' => 'Oldest First'],
                ['value' => 'popularity:desc', 'label' => 'Most Popular'],
            ],
        ];
    }

    /**
     * Get trending products based on recent activity.
     */
    public function getTrendingProducts(int $limit = 8): Collection
    {
        // This is a simplified trending algorithm
        // In a real application, you might track views, purchases, etc.
        return Product::with(['brand', 'category', 'images'])
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get products by multiple categories.
     */
    public function getProductsByCategories(array $categoryIds, int $limit = 12): Collection
    {
        return Product::with(['brand', 'category', 'images'])
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->whereIn('category_id', $categoryIds)
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get products by multiple brands.
     */
    public function getProductsByBrands(array $brandIds, int $limit = 12): Collection
    {
        return Product::with(['brand', 'category', 'images'])
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->whereIn('brand_id', $brandIds)
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Sync product images - upload new images and delete old ones.
     */
    private function syncProductImages(Product $product, array $images): void
    {
        // If images array is empty, do nothing
        if (empty($images)) {
            return;
        }

        // Delete all old images
        foreach ($product->images as $oldImage) {
            // Delete file from storage
            $path = str_replace('/storage/', '', $oldImage->url);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
        $product->images()->delete();

        // Upload and save new images
        foreach ($images as $index => $image) {
            if ($image instanceof UploadedFile) {
                $filename = time() . '_' . $index . '_' . Str::slug($product->name) . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('products', $filename, 'public');
                $url = Storage::url($path);

                ProductImage::create([
                    'product_id' => $product->id,
                    'url' => $url,
                    'alt_text' => $product->name,
                    'sort_order' => $index,
                ]);
            }
        }
    }
}
