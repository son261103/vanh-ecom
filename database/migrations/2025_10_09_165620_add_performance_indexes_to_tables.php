<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add performance indexes for frequently queried columns.
     */
    public function up(): void
    {
        // Products table indexes
        Schema::table('products', function (Blueprint $table) {
            $table->index('slug', 'idx_products_slug');
            $table->index('category_id', 'idx_products_category');
            $table->index('brand_id', 'idx_products_brand');
            $table->index('is_active', 'idx_products_active');
            $table->index(['is_active', 'stock_quantity'], 'idx_products_active_stock');
            $table->index(['category_id', 'is_active'], 'idx_products_category_active');
            $table->index(['brand_id', 'is_active'], 'idx_products_brand_active');
            $table->index(['price', 'is_active'], 'idx_products_price_active');
            $table->index('is_featured', 'idx_products_featured');
            $table->index('created_at', 'idx_products_created');
        });

        // Categories table indexes
        Schema::table('categories', function (Blueprint $table) {
            $table->index('slug', 'idx_categories_slug');
            $table->index('is_active', 'idx_categories_active');
        });

        // Brands table indexes
        Schema::table('brands', function (Blueprint $table) {
            $table->index('slug', 'idx_brands_slug');
            $table->index('is_active', 'idx_brands_active');
        });

        // Cart table indexes
        Schema::table('carts', function (Blueprint $table) {
            $table->index('user_id', 'idx_carts_user');
            $table->index(['user_id', 'product_id'], 'idx_carts_user_product');
        });

        // Orders table indexes
        Schema::table('orders', function (Blueprint $table) {
            $table->index('user_id', 'idx_orders_user');
            $table->index('order_number', 'idx_orders_number');
            $table->index('status', 'idx_orders_status');
            $table->index('payment_status', 'idx_orders_payment_status');
            $table->index('created_at', 'idx_orders_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop products indexes
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_slug');
            $table->dropIndex('idx_products_category');
            $table->dropIndex('idx_products_brand');
            $table->dropIndex('idx_products_active');
            $table->dropIndex('idx_products_active_stock');
            $table->dropIndex('idx_products_category_active');
            $table->dropIndex('idx_products_brand_active');
            $table->dropIndex('idx_products_price_active');
            $table->dropIndex('idx_products_featured');
            $table->dropIndex('idx_products_created');
        });

        // Drop categories indexes
        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex('idx_categories_slug');
            $table->dropIndex('idx_categories_active');
        });

        // Drop brands indexes
        Schema::table('brands', function (Blueprint $table) {
            $table->dropIndex('idx_brands_slug');
            $table->dropIndex('idx_brands_active');
        });

        // Drop cart indexes
        Schema::table('carts', function (Blueprint $table) {
            $table->dropIndex('idx_carts_user');
            $table->dropIndex('idx_carts_user_product');
        });

        // Drop orders indexes
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_user');
            $table->dropIndex('idx_orders_number');
            $table->dropIndex('idx_orders_status');
            $table->dropIndex('idx_orders_payment_status');
            $table->dropIndex('idx_orders_created');
        });
    }
};
