<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Add missing fields
            $table->boolean('is_featured')->default(false)->after('is_active');
            $table->string('short_description', 500)->nullable()->after('description');
            $table->decimal('weight', 10, 2)->nullable()->after('weight_grams');
            $table->string('dimensions', 100)->nullable()->after('weight');
            $table->string('meta_title', 255)->nullable()->after('specs');
            $table->string('meta_description', 500)->nullable()->after('meta_title');
        });
        
        // Rename stock to stock_quantity for consistency
        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('stock', 'stock_quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('stock_quantity', 'stock');
        });
        
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'is_featured',
                'short_description',
                'weight',
                'dimensions',
                'meta_title',
                'meta_description',
            ]);
        });
    }
};
