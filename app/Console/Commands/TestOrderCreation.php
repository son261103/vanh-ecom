<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Product;
use App\Services\CartService;
use App\Services\OrderService;
use Illuminate\Console\Command;

class TestOrderCreation extends Command
{
    protected $signature = 'test:order {user_id}';
    protected $description = 'Test order creation with sample cart';

    public function handle(CartService $cartService, OrderService $orderService)
    {
        $userId = $this->argument('user_id');
        $user = User::find($userId);

        if (!$user) {
            $this->error("User not found!");
            return 1;
        }

        // Clear existing cart
        $cartService->clearCart($user);
        $this->info("Cleared cart for user: {$user->email}");

        // Add some products to cart
        $products = Product::where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->take(2)
            ->get();

        if ($products->isEmpty()) {
            $this->error("No active products found!");
            return 1;
        }

        foreach ($products as $product) {
            $cartService->addToCart($user, $product, 1);
            $this->info("Added to cart: {$product->name} - Price: {$product->price}");
        }

        // Get cart summary
        $summary = $cartService->getCartSummary($user);
        $this->info("\nCart Summary:");
        $this->info("Total items: {$summary['summary']['total_items']}");
        $this->info("Subtotal: {$summary['summary']['subtotal']}");
        $this->info("Total: {$summary['summary']['total']}");

        // Create order
        $orderData = [
            'shipping_address' => [
                'full_name' => 'Test User',
                'phone' => '0123456789',
                'address_line_1' => 'Test Address',
                'city' => 'Hanoi',
                'state' => 'Hanoi',
                'postal_code' => '100000',
                'country' => 'VN',
            ],
            'billing_address' => [
                'full_name' => 'Test User',
                'phone' => '0123456789',
                'address_line_1' => 'Test Address',
                'city' => 'Hanoi',
                'state' => 'Hanoi',
                'postal_code' => '100000',
                'country' => 'VN',
            ],
            'payment_method' => 'cash_on_delivery',
            'notes' => 'Test order',
        ];

        try {
            $order = $orderService->createOrderFromCart($user, $orderData);
            $this->info("\n✅ Order created successfully!");
            $this->info("Order Number: {$order->order_number}");
            $this->info("Order ID: {$order->id}");
            $this->info("Total Amount: {$order->total_amount}");
            $this->info("Items count: " . $order->items->count());

            foreach ($order->items as $item) {
                $this->info("  - {$item->product_name} x{$item->quantity} @ {$item->unit_price}");
            }

            return 0;
        } catch (\Exception $e) {
            $this->error("\n❌ Order creation failed!");
            $this->error($e->getMessage());
            return 1;
        }
    }
}
