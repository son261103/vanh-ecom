<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Policies\OrderPolicy;
use App\Policies\ProductPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Product::class => ProductPolicy::class,
        Order::class => OrderPolicy::class,
        User::class => UserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Define additional gates if needed
        Gate::define('admin-access', function (User $user) {
            return $user->role === 'admin';
        });

        Gate::define('customer-access', function (User $user) {
            return $user->role === 'customer';
        });

        // Gate for managing brands and categories
        Gate::define('manage-brands', function (User $user) {
            return $user->role === 'admin';
        });

        Gate::define('manage-categories', function (User $user) {
            return $user->role === 'admin';
        });

        // Gate for viewing admin statistics
        Gate::define('view-admin-stats', function (User $user) {
            return $user->role === 'admin';
        });

        // Gate for managing images
        Gate::define('manage-images', function (User $user) {
            return $user->role === 'admin';
        });
    }
}
