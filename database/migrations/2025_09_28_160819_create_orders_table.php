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
        Schema::create('orders', function (Blueprint $table) {
            $table->char('id', 36)->primary()->default(DB::raw('(UUID())'));
            $table->string('order_number', 50)->unique();
            $table->char('user_id', 36)->nullable();
            $table->decimal('total_amount', 12, 2);
            $table->json('shipping_address');
            $table->json('billing_address')->nullable();
            $table->enum('status', ['pending', 'processing', 'shipped', 'completed', 'cancelled', 'refunded'])->default('pending');
            $table->text('note')->nullable();
            $table->string('payment_provider', 100)->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->string('provider_payment_id', 255)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['status']);
            $table->index(['user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
