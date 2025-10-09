<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

/**
 * Cache Service
 * 
 * Centralized cache management with invalidation strategies.
 * Provides consistent TTL and cache key patterns across the application.
 */
class CacheService
{
    /**
     * Cache TTL constants (in seconds)
     */
    const TTL_STATIC = 3600;       // 1 hour - For rarely changing data
    const TTL_SEMI_STATIC = 1800;  // 30 minutes - For occasionally changing data
    const TTL_DYNAMIC = 300;       // 5 minutes - For frequently changing data
    const TTL_VOLATILE = 60;       // 1 minute - For highly dynamic data

    /**
     * Cache key prefixes for organization
     */
    const PREFIX_CATEGORIES = 'categories';
    const PREFIX_BRANDS = 'brands';
    const PREFIX_PRODUCTS = 'products';
    const PREFIX_FILTERS = 'filters';
    const PREFIX_USER = 'user';
    const PREFIX_CART = 'cart';
    const PREFIX_ORDERS = 'orders';

    /**
     * Remember a value with automatic TTL based on type
     */
    public static function remember(string $key, string $type, callable $callback): mixed
    {
        $ttl = self::getTtlForType($type);
        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Get TTL for a given type
     */
    private static function getTtlForType(string $type): int
    {
        return match ($type) {
            'static' => self::TTL_STATIC,
            'semi-static' => self::TTL_SEMI_STATIC,
            'dynamic' => self::TTL_DYNAMIC,
            'volatile' => self::TTL_VOLATILE,
            default => self::TTL_DYNAMIC,
        };
    }

    /**
     * Invalidate categories cache
     */
    public static function invalidateCategories(): void
    {
        Cache::forget(self::PREFIX_CATEGORIES . '.active');
        Cache::forget(self::PREFIX_FILTERS . '.options');
        
        // Also clear tagged cache if using Redis
        if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
            Cache::tags([self::PREFIX_CATEGORIES])->flush();
        }
    }

    /**
     * Invalidate brands cache
     */
    public static function invalidateBrands(): void
    {
        Cache::forget(self::PREFIX_BRANDS . '.active');
        Cache::forget(self::PREFIX_FILTERS . '.options');
        
        if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
            Cache::tags([self::PREFIX_BRANDS])->flush();
        }
    }

    /**
     * Invalidate products cache
     */
    public static function invalidateProducts(?string $productId = null): void
    {
        Cache::forget(self::PREFIX_FILTERS . '.options');
        
        if ($productId) {
            Cache::forget(self::PREFIX_PRODUCTS . ".{$productId}");
        }
        
        if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
            Cache::tags([self::PREFIX_PRODUCTS])->flush();
        }
    }

    /**
     * Invalidate user-specific cache
     */
    public static function invalidateUser(string $userId): void
    {
        $patterns = [
            self::PREFIX_USER . ".{$userId}",
            self::PREFIX_CART . ".{$userId}",
            self::PREFIX_ORDERS . ".{$userId}",
        ];

        foreach ($patterns as $pattern) {
            Cache::forget($pattern);
        }

        if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
            Cache::tags([self::PREFIX_USER . ".{$userId}"])->flush();
        }
    }

    /**
     * Invalidate cart cache for a user
     */
    public static function invalidateCart(string $userId): void
    {
        Cache::forget(self::PREFIX_CART . ".{$userId}");
        Cache::forget(self::PREFIX_CART . ".{$userId}.count");
        Cache::forget(self::PREFIX_CART . ".{$userId}.summary");

        if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
            Cache::tags([self::PREFIX_CART . ".{$userId}"])->flush();
        }
    }

    /**
     * Invalidate orders cache for a user
     */
    public static function invalidateOrders(?string $userId = null): void
    {
        if ($userId) {
            Cache::forget(self::PREFIX_ORDERS . ".{$userId}");
            
            if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
                Cache::tags([self::PREFIX_ORDERS . ".{$userId}"])->flush();
            }
        } else {
            // Invalidate all orders cache
            if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
                Cache::tags([self::PREFIX_ORDERS])->flush();
            }
        }
    }

    /**
     * Clear all application cache
     */
    public static function clearAll(): void
    {
        Cache::flush();
    }

    /**
     * Get cache statistics (if available)
     */
    public static function getStats(): array
    {
        if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
            $redis = Cache::getStore()->getRedis();
            $info = $redis->info();
            
            return [
                'memory_used' => $info['used_memory_human'] ?? 'N/A',
                'memory_peak' => $info['used_memory_peak_human'] ?? 'N/A',
                'hit_rate' => isset($info['keyspace_hits'], $info['keyspace_misses'])
                    ? round($info['keyspace_hits'] / ($info['keyspace_hits'] + $info['keyspace_misses']) * 100, 2) . '%'
                    : 'N/A',
                'total_keys' => $redis->dbSize(),
            ];
        }

        return ['driver' => config('cache.default'), 'stats' => 'not available'];
    }
}
