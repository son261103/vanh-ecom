<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\BrandResource;
use App\Http\Resources\CategoryResource;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    protected ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Display a listing of products for customers.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->get('search'),
            'category_id' => $request->get('category_id'),
            'brand_id' => $request->get('brand_id'),
            'min_price' => $request->get('min_price'),
            'max_price' => $request->get('max_price'),
            'is_featured' => $request->get('is_featured'),
            'in_stock' => true, // Only show products in stock for customers
            'sort_by' => $request->get('sort_by', 'created_at'),
            'sort_order' => $request->get('sort_order', 'desc'),
        ];

        $perPage = $request->get('per_page', 12);
        $products = $this->productService->getPaginatedProducts($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Display the specified product.
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::with(['brand', 'category', 'images'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        // Get related products
        $relatedProducts = $this->productService->getRelatedProducts($product, 4);

        return response()->json([
            'success' => true,
            'data' => [
                'product' => new ProductResource($product),
                'related_products' => ProductResource::collection($relatedProducts),
            ],
        ]);
    }

    /**
     * Get featured products.
     */
    public function featured(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 8);
        $products = $this->productService->getFeaturedProducts($limit);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
        ]);
    }

    /**
     * Search products.
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Search query must be at least 2 characters',
            ], 422);
        }

        $filters = [
            'search' => $query,
            'category_id' => $request->get('category_id'),
            'brand_id' => $request->get('brand_id'),
            'min_price' => $request->get('min_price'),
            'max_price' => $request->get('max_price'),
            'in_stock' => true,
            'sort_by' => $request->get('sort_by', 'name'),
            'sort_order' => $request->get('sort_order', 'asc'),
        ];

        $perPage = $request->get('per_page', 12);
        $products = $this->productService->getPaginatedProducts($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'query' => $query,
            ],
        ]);
    }

    /**
     * Get products by category.
     */
    public function byCategory(string $categorySlug, Request $request): JsonResponse
    {
        $category = Category::where('slug', $categorySlug)
            ->where('is_active', true)
            ->firstOrFail();

        $filters = [
            'category_id' => $category->id,
            'search' => $request->get('search'),
            'brand_id' => $request->get('brand_id'),
            'min_price' => $request->get('min_price'),
            'max_price' => $request->get('max_price'),
            'in_stock' => true,
            'sort_by' => $request->get('sort_by', 'created_at'),
            'sort_order' => $request->get('sort_order', 'desc'),
        ];

        $perPage = $request->get('per_page', 12);
        $products = $this->productService->getPaginatedProducts($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'category' => new CategoryResource($category),
                'products' => ProductResource::collection($products->items()),
            ],
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Get products by brand.
     */
    public function byBrand(string $brandSlug, Request $request): JsonResponse
    {
        $brand = Brand::where('slug', $brandSlug)
            ->where('is_active', true)
            ->firstOrFail();

        $filters = [
            'brand_id' => $brand->id,
            'search' => $request->get('search'),
            'category_id' => $request->get('category_id'),
            'min_price' => $request->get('min_price'),
            'max_price' => $request->get('max_price'),
            'in_stock' => true,
            'sort_by' => $request->get('sort_by', 'created_at'),
            'sort_order' => $request->get('sort_order', 'desc'),
        ];

        $perPage = $request->get('per_page', 12);
        $products = $this->productService->getPaginatedProducts($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'brand' => new BrandResource($brand),
                'products' => ProductResource::collection($products->items()),
            ],
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Get all active categories.
     */
    public function categories(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->withCount(['products' => function ($query) {
                $query->where('is_active', true)->where('stock_quantity', '>', 0);
            }])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Get all active brands.
     */
    public function brands(): JsonResponse
    {
        $brands = Brand::where('is_active', true)
            ->withCount(['products' => function ($query) {
                $query->where('is_active', true)->where('stock_quantity', '>', 0);
            }])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => BrandResource::collection($brands),
        ]);
    }

    /**
     * Get search suggestions.
     */
    public function searchSuggestions(Request $request): JsonResponse
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Query must be at least 2 characters',
            ], 422);
        }

        $suggestions = $this->productService->getSearchSuggestions($query, 5);

        return response()->json([
            'success' => true,
            'data' => $suggestions,
        ]);
    }

    /**
     * Get filter options.
     */
    public function filterOptions(): JsonResponse
    {
        $options = $this->productService->getFilterOptions();

        return response()->json([
            'success' => true,
            'data' => $options,
        ]);
    }

    /**
     * Get trending products.
     */
    public function trending(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 8);
        $products = $this->productService->getTrendingProducts($limit);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
        ]);
    }
}
