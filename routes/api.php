<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\User\ProductController as UserProductController;
use App\Http\Controllers\Api\User\CartController;
use App\Http\Controllers\Api\User\OrderController as UserOrderController;
use App\Http\Controllers\Api\User\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Test route to verify API is working
Route::get('test', function () {
    return response()->json([
        'success' => true,
        'message' => 'Vanh E-Commerce API is working!',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0',
    ]);
});

// Health check route
Route::get('health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
    ]);
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

// Public authentication routes
Route::prefix('auth')->middleware(['throttle.custom:auth,10,1'])->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Protected authentication routes
Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    Route::post('refresh', [AuthController::class, 'refresh']);
});

/*
|--------------------------------------------------------------------------
| Public User Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

Route::prefix('public')->middleware(['throttle.custom:public,120,1'])->group(function () {
    // Products
    Route::prefix('products')->group(function () {
        Route::get('/', [UserProductController::class, 'index']);
        Route::get('/featured', [UserProductController::class, 'featured']);
        Route::get('/trending', [UserProductController::class, 'trending']);
        Route::get('/search', [UserProductController::class, 'search']);
        Route::get('/search-suggestions', [UserProductController::class, 'searchSuggestions']);
        Route::get('/filter-options', [UserProductController::class, 'filterOptions']);
        Route::get('/{slug}', [UserProductController::class, 'show']);
    });

    // Categories and Brands
    Route::get('categories', [UserProductController::class, 'categories']);
    Route::get('brands', [UserProductController::class, 'brands']);
    Route::get('categories/{slug}/products', [UserProductController::class, 'byCategory']);
    Route::get('brands/{slug}/products', [UserProductController::class, 'byBrand']);
});

/*
|--------------------------------------------------------------------------
| User Routes (Authentication Required)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'throttle.custom:user,100,1'])->prefix('user')->group(function () {

    // Profile Management
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::post('change-password', [ProfileController::class, 'changePassword']);
        Route::get('order-history', [ProfileController::class, 'orderHistory']);
        Route::get('favorite-categories', [ProfileController::class, 'favoriteCategories']);
        Route::delete('delete-account', [ProfileController::class, 'deleteAccount']);
    });

    // Cart Management
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/', [CartController::class, 'store']);
        Route::put('/{cartItemId}', [CartController::class, 'update']);
        Route::delete('/{cartItemId}', [CartController::class, 'destroy']);
        Route::delete('/', [CartController::class, 'clear']);
        Route::get('/count', [CartController::class, 'count']);
        Route::get('/validate', [CartController::class, 'validate']);
        Route::get('/recommendations', [CartController::class, 'recommendations']);
        Route::post('/apply-discount', [CartController::class, 'applyDiscount']);
    });

    // Order Management
    Route::prefix('orders')->group(function () {
        Route::get('/', [UserOrderController::class, 'index']);
        Route::post('/', [UserOrderController::class, 'store']);
        Route::get('/{order}', [UserOrderController::class, 'show']);
        Route::post('/{order}/cancel', [UserOrderController::class, 'cancel']);
        Route::get('/number/{orderNumber}', [UserOrderController::class, 'getByOrderNumber']);
        Route::get('/track/{orderNumber}', [UserOrderController::class, 'track']);
    });
});

/*
|--------------------------------------------------------------------------
| Admin Routes (Admin Authentication Required)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:admin', 'throttle.custom:admin,200,1'])->prefix('admin')->group(function () {

    // Brand Management
    Route::prefix('brands')->group(function () {
        Route::get('/', [AdminBrandController::class, 'index']);
        Route::post('/', [AdminBrandController::class, 'store']);
        Route::get('/options', [AdminBrandController::class, 'options']);
        Route::get('/{brand}', [AdminBrandController::class, 'show']);
        Route::put('/{brand}', [AdminBrandController::class, 'update']);
        Route::delete('/{brand}', [AdminBrandController::class, 'destroy']);
        Route::post('/{brand}/toggle-status', [AdminBrandController::class, 'toggleStatus']);
    });

    // Category Management
    Route::prefix('categories')->group(function () {
        Route::get('/', [AdminCategoryController::class, 'index']);
        Route::post('/', [AdminCategoryController::class, 'store']);
        Route::get('/options', [AdminCategoryController::class, 'options']);
        Route::get('/{category}', [AdminCategoryController::class, 'show']);
        Route::put('/{category}', [AdminCategoryController::class, 'update']);
        Route::delete('/{category}', [AdminCategoryController::class, 'destroy']);
        Route::post('/{category}/toggle-status', [AdminCategoryController::class, 'toggleStatus']);
    });

    // Product Management
    Route::prefix('products')->group(function () {
        Route::get('/', [AdminProductController::class, 'index']);
        Route::post('/', [AdminProductController::class, 'store']);
        Route::get('/stats', [AdminProductController::class, 'stats']);
        Route::get('/{product}', [AdminProductController::class, 'show']);
        Route::put('/{product}', [AdminProductController::class, 'update']);
        Route::delete('/{product}', [AdminProductController::class, 'destroy']);
        Route::post('/{product}/toggle-status', [AdminProductController::class, 'toggleStatus']);
        Route::post('/{product}/toggle-featured', [AdminProductController::class, 'toggleFeatured']);
        Route::post('/{product}/update-stock', [AdminProductController::class, 'updateStock']);
    });

    // User Management
    Route::prefix('users')->group(function () {
        Route::get('/', [AdminUserController::class, 'index']);
        Route::post('/', [AdminUserController::class, 'store']);
        Route::get('/stats', [AdminUserController::class, 'stats']);
        Route::get('/top-customers', [AdminUserController::class, 'topCustomers']);
        Route::get('/search', [AdminUserController::class, 'search']);
        Route::get('/{user}', [AdminUserController::class, 'show']);
        Route::put('/{user}', [AdminUserController::class, 'update']);
        Route::delete('/{user}', [AdminUserController::class, 'destroy']);
        Route::post('/{user}/toggle-status', [AdminUserController::class, 'toggleStatus']);
        Route::post('/{user}/reset-password', [AdminUserController::class, 'resetPassword']);
    });

    // Order Management
    Route::prefix('orders')->group(function () {
        Route::get('/', [AdminOrderController::class, 'index']);
        Route::get('/stats', [AdminOrderController::class, 'stats']);
        Route::get('/revenue-stats', [AdminOrderController::class, 'revenueStats']);
        Route::get('/{order}', [AdminOrderController::class, 'show']);
        Route::post('/{order}/update-status', [AdminOrderController::class, 'updateStatus']);
        Route::post('/{order}/update-payment-status', [AdminOrderController::class, 'updatePaymentStatus']);
        Route::post('/{order}/cancel', [AdminOrderController::class, 'cancel']);
    });

    // Image Management
    Route::prefix('images')->group(function () {
        Route::post('/upload', [ImageController::class, 'uploadSingle']);
        Route::post('/upload-multiple', [ImageController::class, 'uploadMultiple']);
        Route::delete('/delete', [ImageController::class, 'delete']);
        Route::post('/transform', [ImageController::class, 'transform']);
    });
});
