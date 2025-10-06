<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Resources\OrderResource;
use App\Services\UserService;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

/**
 * @method \App\Models\User|null auth()
 */
class ProfileController extends Controller
{
    protected UserService $userService;
    protected OrderService $orderService;

    public function __construct(UserService $userService, OrderService $orderService)
    {
        $this->userService = $userService;
        $this->orderService = $orderService;
    }

    /**
     * Get user profile.
     */
    public function show(): JsonResponse
    {
        $user = auth()->user();
        $orderSummary = $this->userService->getUserOrderSummary($user);

        return response()->json([
            'success' => true,
            'data' => [
                'profile' => new UserResource($user),
                'order_summary' => $orderSummary,
            ],
        ]);
    }

    /**
     * Update user profile.
     */
    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:30',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = auth()->user();
        $updatedUser = $this->userService->updateProfile($user, $validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => new UserResource($updatedUser),
        ]);
    }

    /**
     * Change password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = auth()->user();
            $this->userService->changePassword(
                $user,
                $request->current_password,
                $request->password
            );

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get user's order history.
     */
    public function orderHistory(Request $request): JsonResponse
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
     * Get user's favorite categories.
     */
    public function favoriteCategories(): JsonResponse
    {
        $user = auth()->user();
        $orderSummary = $this->userService->getUserOrderSummary($user);

        return response()->json([
            'success' => true,
            'data' => $orderSummary['favorite_categories'],
        ]);
    }

    /**
     * Delete user account.
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
            'confirmation' => 'required|string|in:DELETE_MY_ACCOUNT',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = auth()->user();

        // Verify password
        if (!Hash::check($request->password, $user->password_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid password',
            ], 422);
        }

        try {
            // Revoke all tokens
            $user->tokens()->delete();

            // Delete user account
            $this->userService->deleteUser($user);

            return response()->json([
                'success' => true,
                'message' => 'Account deleted successfully',
            ]);
        } catch (\Exception) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete account. Please try again.',
            ], 500);
        }
    }
}
