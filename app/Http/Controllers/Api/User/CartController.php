<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddToCartRequest;
use App\Http\Requests\Cart\UpdateCartRequest;
use App\Http\Resources\CartResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @method \App\Models\User|null auth()
 */
class CartController extends Controller
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Get user's cart items.
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        $cartSummary = $this->cartService->getCartSummary($user);

        return response()->json([
            'success' => true,
            'data' => [
                'items' => CartResource::collection($cartSummary['items']),
                'summary' => $cartSummary['summary'],
            ],
        ]);
    }

    /**
     * Add item to cart.
     */
    public function store(AddToCartRequest $request): JsonResponse
    {
        $user = Auth::user();
        $product = Product::findOrFail($request->product_id);

        try {
            $cartItem = $this->cartService->addToCart($user, $product, $request->quantity);

            return response()->json([
                'success' => true,
                'message' => 'Item added to cart successfully',
                'data' => new CartResource($cartItem),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Update cart item quantity.
     */
    public function update(UpdateCartRequest $request, string $cartItemId): JsonResponse
    {
        $user = Auth::user();

        try {
            $cartItem = $this->cartService->updateCartItem($user, $cartItemId, $request->quantity);

            return response()->json([
                'success' => true,
                'message' => 'Cart item updated successfully',
                'data' => new CartResource($cartItem),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Remove item from cart.
     */
    public function destroy(string $cartItemId): JsonResponse
    {
        $user = Auth::user();

        try {
            $this->cartService->removeFromCart($user, $cartItemId);

            return response()->json([
                'success' => true,
                'message' => 'Item removed from cart successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Clear all items from cart.
     */
    public function clear(): JsonResponse
    {
        $user = Auth::user();
        $this->cartService->clearCart($user);

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared successfully',
        ]);
    }

    /**
     * Get cart items count.
     */
    public function count(): JsonResponse
    {
        $user = Auth::user();
        $count = $this->cartService->getCartItemsCount($user);

        return response()->json([
            'success' => true,
            'data' => [
                'count' => $count,
            ],
        ]);
    }

    /**
     * Validate cart before checkout.
     */
    public function validate(): JsonResponse
    {
        $user = Auth::user();
        $validation = $this->cartService->validateCart($user);

        return response()->json([
            'success' => $validation['valid'],
            'data' => $validation,
        ], $validation['valid'] ? 200 : 422);
    }

    /**
     * Get recommended products based on cart items.
     */
    public function recommendations(): JsonResponse
    {
        $user = Auth::user();
        $recommendations = $this->cartService->getRecommendedProducts($user, 4);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($recommendations),
        ]);
    }

    /**
     * Apply discount code to cart.
     */
    public function applyDiscount(Request $request): JsonResponse
    {
        $request->validate([
            'discount_code' => 'required|string|max:50',
        ]);

        $user = auth()->user();
        $result = $this->cartService->applyDiscount($user, $request->discount_code);

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
            'data' => [
                'discount_amount' => $result['discount_amount'],
            ],
        ], $result['success'] ? 200 : 422);
    }
}
