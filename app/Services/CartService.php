<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class CartService
{
    /**
     * Get user's cart items.
     */
    public function getCartItems(User $user): Collection
    {
        return Cart::with(['product.brand', 'product.category', 'product.images'])
            ->where('user_id', $user->id)
            ->get();
    }

    /**
     * Add item to cart.
     */
    public function addToCart(User $user, Product $product, int $quantity): Cart
    {
        return DB::transaction(function () use ($user, $product, $quantity) {
            // Check if product is available
            if (!$product->is_active || $product->stock_quantity < $quantity) {
                throw new \Exception('Product is not available or insufficient stock.');
            }

            // Check if item already exists in cart
            $existingCartItem = Cart::where('user_id', $user->id)
                ->where('product_id', $product->id)
                ->first();

            if ($existingCartItem) {
                // Update quantity
                $newQuantity = $existingCartItem->quantity + $quantity;
                
                // Check stock availability for new quantity
                if ($product->stock_quantity < $newQuantity) {
                    throw new \Exception('Insufficient stock for requested quantity.');
                }

                $existingCartItem->update(['quantity' => $newQuantity]);
                return $existingCartItem->load(['product.brand', 'product.category', 'product.images']);
            }

            // Create new cart item
            $cartItem = Cart::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
            ]);

            return $cartItem->load(['product.brand', 'product.category', 'product.images']);
        });
    }

    /**
     * Update cart item quantity.
     */
    public function updateCartItem(User $user, string $cartItemId, int $quantity): Cart
    {
        return DB::transaction(function () use ($user, $cartItemId, $quantity) {
            $cartItem = Cart::where('id', $cartItemId)
                ->where('user_id', $user->id)
                ->firstOrFail();

            // Check stock availability
            if ($cartItem->product->stock_quantity < $quantity) {
                throw new \Exception('Insufficient stock for requested quantity.');
            }

            $cartItem->update(['quantity' => $quantity]);

            return $cartItem->load(['product.brand', 'product.category', 'product.images']);
        });
    }

    /**
     * Remove item from cart.
     */
    public function removeFromCart(User $user, string $cartItemId): bool
    {
        $cartItem = Cart::where('id', $cartItemId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        return $cartItem->delete();
    }

    /**
     * Clear user's cart.
     */
    public function clearCart(User $user): bool
    {
        return Cart::where('user_id', $user->id)->delete() > 0;
    }

    /**
     * Get cart summary.
     */
    public function getCartSummary(User $user): array
    {
        $cartItems = $this->getCartItems($user);

        $subtotal = 0;
        $totalItems = 0;
        $totalQuantity = 0;

        foreach ($cartItems as $item) {
            $price = $item->product->sale_price ?? $item->product->price;
            $subtotal += $price * $item->quantity;
            $totalItems++;
            $totalQuantity += $item->quantity;
        }

        // No tax and free shipping - only product price
        $tax = 0;
        $shipping = 0;
        $total = $subtotal;

        return [
            'items' => $cartItems,
            'summary' => [
                'total_items' => $totalItems,
                'total_quantity' => $totalQuantity,
                'subtotal' => round($subtotal, 2),
                'tax' => round($tax, 2),
                'shipping' => round($shipping, 2),
                'total' => round($total, 2),
            ],
        ];
    }

    /**
     * Validate cart items before checkout.
     */
    public function validateCart(User $user): array
    {
        $cartItems = $this->getCartItems($user);
        $errors = [];

        if ($cartItems->isEmpty()) {
            $errors[] = 'Cart is empty.';
            return ['valid' => false, 'errors' => $errors];
        }

        foreach ($cartItems as $item) {
            $product = $item->product;

            // Check if product is still active
            if (!$product->is_active) {
                $errors[] = "Product '{$product->name}' is no longer available.";
                continue;
            }

            // Check stock availability
            if ($product->stock_quantity < $item->quantity) {
                $available = $product->stock_quantity;
                $errors[] = "Product '{$product->name}' has only {$available} items in stock, but you have {$item->quantity} in your cart.";
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Get cart items count for a user.
     */
    public function getCartItemsCount(User $user): int
    {
        return Cart::where('user_id', $user->id)->sum('quantity');
    }

    /**
     * Merge guest cart with user cart (for when user logs in).
     */
    public function mergeGuestCart(User $user, array $guestCartItems): Collection
    {
        return DB::transaction(function () use ($user, $guestCartItems) {
            $mergedItems = collect();

            foreach ($guestCartItems as $guestItem) {
                $product = Product::find($guestItem['product_id']);
                
                if (!$product || !$product->is_active) {
                    continue;
                }

                try {
                    $cartItem = $this->addToCart($user, $product, $guestItem['quantity']);
                    $mergedItems->push($cartItem);
                } catch (\Exception $e) {
                    // Skip items that can't be added (e.g., insufficient stock)
                    continue;
                }
            }

            return $mergedItems;
        });
    }

    /**
     * Apply discount code to cart (placeholder for future implementation).
     */
    public function applyDiscount(User $user, string $discountCode): array
    {
        // This is a placeholder for discount functionality
        // In a real application, you would validate the discount code
        // and apply the appropriate discount

        return [
            'success' => false,
            'message' => 'Discount functionality not implemented yet.',
            'discount_amount' => 0,
        ];
    }

    /**
     * Get recommended products based on cart items.
     */
    public function getRecommendedProducts(User $user, int $limit = 4): Collection
    {
        $cartItems = $this->getCartItems($user);
        
        if ($cartItems->isEmpty()) {
            return collect();
        }

        $categoryIds = $cartItems->pluck('product.category_id')->unique();
        $brandIds = $cartItems->pluck('product.brand_id')->unique();
        $productIds = $cartItems->pluck('product_id');

        return Product::with(['brand', 'category', 'images'])
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->whereNotIn('id', $productIds)
            ->where(function ($query) use ($categoryIds, $brandIds) {
                $query->whereIn('category_id', $categoryIds)
                      ->orWhereIn('brand_id', $brandIds);
            })
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
