<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\CreateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @method \App\Models\User|null auth()
 */
class OrderController extends Controller
{
    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Display user's orders.
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $perPage = $request->get('per_page', 10);

        $orders = $this->orderService->getUserOrders($user, $perPage);

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders->items()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Create order from cart.
     */
    public function store(CreateOrderRequest $request): JsonResponse
    {
        $user = auth()->user();

        try {
            $order = $this->orderService->createOrderFromCart($user, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => new OrderResource($order),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order): JsonResponse
    {
        // Ensure user can only view their own orders
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        // Load order items with complete product details
        $order->load([
            'user',
            'items.product.images',
            'items.product.brand',
            'items.product.category'
        ]);

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * Cancel an order.
     */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        // Ensure user can only cancel their own orders
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            if (!$this->orderService->canUserCancelOrder($order, auth()->user())) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order cannot be cancelled in current status',
                ], 422);
            }

            $cancelledOrder = $this->orderService->cancelOrder($order, $request->reason);

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'data' => new OrderResource($cancelledOrder),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get order by order number.
     */
    public function getByOrderNumber(string $orderNumber): JsonResponse
    {
        $order = $this->orderService->getOrderByNumber($orderNumber);

        if (!$order || $order->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * Track order status.
     */
    public function track(string $orderNumber): JsonResponse
    {
        $order = $this->orderService->getOrderByNumber($orderNumber);

        if (!$order || $order->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        // Order tracking information
        $trackingInfo = [
            'order_number' => $order->order_number,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'created_at' => $order->created_at,
            'timeline' => $this->getOrderTimeline($order),
        ];

        return response()->json([
            'success' => true,
            'data' => $trackingInfo,
        ]);
    }

    /**
     * Get order timeline for tracking.
     */
    private function getOrderTimeline(Order $order): array
    {
        $timeline = [
            [
                'status' => 'pending',
                'label' => 'Order Placed',
                'completed' => true,
                'date' => $order->created_at,
            ],
            [
                'status' => 'confirmed',
                'label' => 'Order Confirmed',
                'completed' => in_array($order->status, ['confirmed', 'processing', 'shipped', 'delivered']),
                'date' => null,
            ],
            [
                'status' => 'processing',
                'label' => 'Processing',
                'completed' => in_array($order->status, ['processing', 'shipped', 'delivered']),
                'date' => null,
            ],
            [
                'status' => 'shipped',
                'label' => 'Shipped',
                'completed' => in_array($order->status, ['shipped', 'delivered']),
                'date' => null,
            ],
            [
                'status' => 'delivered',
                'label' => 'Delivered',
                'completed' => $order->status === 'delivered',
                'date' => null,
            ],
        ];

        // If order is cancelled, show cancelled status
        if ($order->status === 'cancelled') {
            $timeline[] = [
                'status' => 'cancelled',
                'label' => 'Cancelled',
                'completed' => true,
                'date' => $order->updated_at,
            ];
        }

        return $timeline;
    }
}
