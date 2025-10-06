<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserService
{
    /**
     * Get paginated users with optional filters.
     */
    public function getPaginatedUsers(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = User::query();

        // Apply filters
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        
        $allowedSortFields = ['email', 'full_name', 'role', 'created_at', 'is_active'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        return $query->paginate($perPage);
    }

    /**
     * Create a new user.
     */
    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            // Hash password
            if (isset($data['password'])) {
                $data['password_hash'] = Hash::make($data['password']);
                unset($data['password']);
            }

            // Set default values
            $data['is_active'] = $data['is_active'] ?? true;
            $data['role'] = $data['role'] ?? 'customer';

            return User::create($data);
        });
    }

    /**
     * Update an existing user.
     */
    public function updateUser(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            // Hash password if provided
            if (isset($data['password'])) {
                $data['password_hash'] = Hash::make($data['password']);
                unset($data['password']);
            }

            $user->update($data);

            return $user->fresh();
        });
    }

    /**
     * Delete a user and handle related data.
     */
    public function deleteUser(User $user): bool
    {
        return DB::transaction(function () use ($user) {
            // Clear user's cart
            $user->carts()->delete();

            // Note: We don't delete orders to maintain order history
            // Instead, we could anonymize the user data or mark as deleted

            return $user->delete();
        });
    }

    /**
     * Activate or deactivate a user.
     */
    public function toggleUserStatus(User $user): User
    {
        $user->update(['is_active' => !$user->is_active]);
        return $user->fresh();
    }

    /**
     * Change user password.
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        // Verify current password
        if (!Hash::check($currentPassword, $user->password_hash)) {
            throw new \Exception('Current password is incorrect.');
        }

        // Update password
        $user->update(['password_hash' => Hash::make($newPassword)]);

        return true;
    }

    /**
     * Update user profile.
     */
    public function updateProfile(User $user, array $data): User
    {
        // Remove sensitive fields that shouldn't be updated via profile
        $allowedFields = ['full_name', 'phone'];
        $filteredData = array_intersect_key($data, array_flip($allowedFields));

        $user->update($filteredData);

        return $user->fresh();
    }

    /**
     * Get user statistics.
     */
    public function getUserStats(): array
    {
        return [
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'inactive_users' => User::where('is_active', false)->count(),
            'admin_users' => User::where('role', 'admin')->count(),
            'customer_users' => User::where('role', 'customer')->count(),
            'new_users_today' => User::whereDate('created_at', today())->count(),
            'new_users_this_week' => User::whereBetween('created_at', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->count(),
            'new_users_this_month' => User::whereMonth('created_at', now()->month)
                                         ->whereYear('created_at', now()->year)
                                         ->count(),
        ];
    }

    /**
     * Get users with recent activity.
     */
    public function getRecentlyActiveUsers(int $limit = 10): Collection
    {
        return User::where('is_active', true)
            ->whereHas('orders', function ($query) {
                $query->where('created_at', '>=', now()->subDays(30));
            })
            ->withCount(['orders' => function ($query) {
                $query->where('created_at', '>=', now()->subDays(30));
            }])
            ->orderBy('orders_count', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get top customers by order value.
     */
    public function getTopCustomers(int $limit = 10): Collection
    {
        return User::where('role', 'customer')
            ->where('is_active', true)
            ->withSum(['orders' => function ($query) {
                $query->whereIn('status', ['confirmed', 'processing', 'shipped', 'delivered'])
                      ->where('payment_status', 'paid');
            }], 'total_amount')
            ->withCount(['orders' => function ($query) {
                $query->whereIn('status', ['confirmed', 'processing', 'shipped', 'delivered']);
            }])
            ->orderBy('orders_sum_total_amount', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Search users by email or name.
     */
    public function searchUsers(string $query, int $limit = 20): Collection
    {
        return User::where('email', 'like', "%{$query}%")
            ->orWhere('full_name', 'like', "%{$query}%")
            ->limit($limit)
            ->get(['id', 'email', 'full_name', 'role']);
    }

    /**
     * Get user's order history summary.
     */
    public function getUserOrderSummary(User $user): array
    {
        $orders = $user->orders()
            ->whereIn('status', ['confirmed', 'processing', 'shipped', 'delivered'])
            ->where('payment_status', 'paid');

        return [
            'total_orders' => $orders->count(),
            'total_spent' => $orders->sum('total_amount'),
            'average_order_value' => $orders->avg('total_amount'),
            'last_order_date' => $user->orders()->latest()->first()?->created_at,
            'favorite_categories' => $this->getUserFavoriteCategories($user),
        ];
    }

    /**
     * Get user's favorite categories based on order history.
     */
    private function getUserFavoriteCategories(User $user, int $limit = 3): Collection
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.user_id', $user->id)
            ->whereIn('orders.status', ['confirmed', 'processing', 'shipped', 'delivered'])
            ->select('categories.id', 'categories.name', DB::raw('SUM(order_items.quantity) as total_quantity'))
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('total_quantity', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Check if email is available for registration.
     */
    public function isEmailAvailable(string $email, ?string $excludeUserId = null): bool
    {
        $query = User::where('email', $email);
        
        if ($excludeUserId) {
            $query->where('id', '!=', $excludeUserId);
        }

        return !$query->exists();
    }

    /**
     * Get user by email.
     */
    public function getUserByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Reset user password (for admin).
     */
    public function resetUserPassword(User $user, string $newPassword): bool
    {
        $user->update(['password_hash' => Hash::make($newPassword)]);
        return true;
    }
}
