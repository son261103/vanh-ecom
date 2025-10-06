<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    protected CartService $cartService;
    protected ProductService $productService;

    public function __construct(CartService $cartService, ProductService $productService)
    {
        $this->cartService = $cartService;
        $this->productService = $productService;
    }

    /**
     * Create order from user's cart.
     */
    public function createOrderFromCart(User $user, array $orderData): Order
    {
        return DB::transaction(function () use ($user, $orderData) {
            // Validate cart
            $cartValidation = $this->cartService->validateCart($user);
            if (!$cartValidation['valid']) {
                throw new \Exception('Cart validation failed: ' . implode(', ', $cartValidation['errors']));
            }

            // Get cart summary
            $cartSummary = $this->cartService->getCartSummary($user);
            $cartItems = $cartSummary['items'];

            if ($cartItems->isEmpty()) {
                throw new \Exception('Cart is empty.');
            }

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $this->generateOrderNumber(),
                'status' => 'pending',
                'total_amount' => $cartSummary['summary']['total'],
                'shipping_address' => json_encode($orderData['shipping_address']),
                'billing_address' => json_encode($orderData['billing_address'] ?? $orderData['shipping_address']),
                'payment_method' => $orderData['payment_method'],
                'payment_status' => 'pending',
                'notes' => $orderData['notes'] ?? null,
            ]);

            // Create order items
            foreach ($cartItems as $cartItem) {
                $product = $cartItem->product;
                $unitPrice = $product->sale_price ?? $product->price;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $unitPrice * $cartItem->quantity,
                ]);

                // Update product stock
                $this->productService->updateStock($product, $cartItem->quantity, 'subtract');
            }

            // Clear cart
            $this->cartService->clearCart($user);

            return $order->load(['items.product', 'user']);
        });
    }

    /**
     * Get user's orders with pagination.
     */
    public function getUserOrders(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return Order::with(['items.product.images'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get all orders with pagination (admin).
     */
    public function getAllOrders(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Order::with(['items.product', 'user']);

        // Apply filters
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('email', 'like', "%{$search}%")
                               ->orWhere('full_name', 'like', "%{$search}%");
                  });
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Update order status.
     */
    public function updateOrderStatus(Order $order, string $status): Order
    {
        $allowedStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        
        if (!in_array($status, $allowedStatuses)) {
            throw new \Exception('Invalid order status.');
        }

        return DB::transaction(function () use ($order, $status) {
            $oldStatus = $order->status;
            $order->update(['status' => $status]);

            // If order is cancelled, restore stock
            if ($status === 'cancelled' && $oldStatus !== 'cancelled') {
                foreach ($order->items as $item) {
                    $this->productService->updateStock($item->product, $item->quantity, 'add');
                }
            }

            return $order->fresh(['items.product', 'user']);
        });
    }

    /**
     * Update payment status.
     */
    public function updatePaymentStatus(Order $order, string $paymentStatus): Order
    {
        $allowedStatuses = ['pending', 'paid', 'failed', 'refunded'];
        
        if (!in_array($paymentStatus, $allowedStatuses)) {
            throw new \Exception('Invalid payment status.');
        }

        $order->update(['payment_status' => $paymentStatus]);

        // If payment is confirmed and order is still pending, move to confirmed
        if ($paymentStatus === 'paid' && $order->status === 'pending') {
            $order->update(['status' => 'confirmed']);
        }

        return $order->fresh(['items.product', 'user']);
    }

    /**
     * Cancel order.
     */
    public function cancelOrder(Order $order, ?string $reason = null): Order
    {
        if (in_array($order->status, ['shipped', 'delivered', 'cancelled'])) {
            throw new \Exception('Order cannot be cancelled in current status.');
        }

        return DB::transaction(function () use ($order, $reason) {
            // Restore stock
            foreach ($order->items as $item) {
                $this->productService->updateStock($item->product, $item->quantity, 'add');
            }

            $order->update([
                'status' => 'cancelled',
                'notes' => $order->notes . ($reason ? "\nCancellation reason: {$reason}" : ''),
            ]);

            return $order->fresh(['items.product', 'user']);
        });
    }

    /**
     * Get order statistics.
     */
    public function getOrderStats(): array
    {
        return [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'confirmed_orders' => Order::where('status', 'confirmed')->count(),
            'processing_orders' => Order::where('status', 'processing')->count(),
            'shipped_orders' => Order::where('status', 'shipped')->count(),
            'delivered_orders' => Order::where('status', 'delivered')->count(),
            'cancelled_orders' => Order::where('status', 'cancelled')->count(),
            'total_revenue' => Order::whereIn('status', ['confirmed', 'processing', 'shipped', 'delivered'])
                                   ->where('payment_status', 'paid')
                                   ->sum('total_amount'),
            'pending_payments' => Order::where('payment_status', 'pending')->count(),
        ];
    }

    /**
     * Get revenue statistics by period.
     */
    public function getRevenueStats(string $period = 'month'): array
    {
        $query = Order::whereIn('status', ['confirmed', 'processing', 'shipped', 'delivered'])
                     ->where('payment_status', 'paid');

        switch ($period) {
            case 'today':
                $query->whereDate('created_at', today());
                break;
            case 'week':
                $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('created_at', now()->month)
                      ->whereYear('created_at', now()->year);
                break;
            case 'year':
                $query->whereYear('created_at', now()->year);
                break;
        }

        return [
            'period' => $period,
            'total_orders' => $query->count(),
            'total_revenue' => $query->sum('total_amount'),
            'average_order_value' => $query->avg('total_amount'),
        ];
    }

    /**
     * Generate unique order number.
     */
    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6));
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    /**
     * Get order by order number.
     */
    public function getOrderByNumber(string $orderNumber): ?Order
    {
        return Order::with(['items.product.images', 'user'])
            ->where('order_number', $orderNumber)
            ->first();
    }

    /**
     * Check if user can cancel order.
     */
    public function canUserCancelOrder(Order $order, User $user): bool
    {
        return $order->user_id === $user->id && 
               !in_array($order->status, ['shipped', 'delivered', 'cancelled']);
    }
}
