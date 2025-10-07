import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Heart, TrendingUp, Eye, ShoppingCart, Sparkles } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import { ProductCard } from '../../components/user/ProductCard';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export const UserDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { orders, fetchOrders } = useOrderStore();
  const { featuredProducts, fetchFeaturedProducts } = useProductStore();
  const { cartCount, fetchCartCount } = useCartStore();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchOrders(1),
        fetchFeaturedProducts(),
        fetchCartCount(),
      ]);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      const totalSpent = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + order.total, 0);
      const pendingCount = orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length;
      
      setStats({
        totalOrders: orders.length,
        pendingOrders: pendingCount,
        totalSpent,
      });
    }
  }, [orders]);

  const recentOrders = orders.slice(0, 3);
  const displayProducts = featuredProducts.slice(0, 4);

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-8">
      {/* Hero Welcome Section */}
      <div
        className="bg-gradient-to-br from-primary-600 via-rose-500 to-primary-700 rounded-2xl p-8 md:p-12 text-white overflow-hidden relative"
        data-aos="fade-down"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-6 h-6" />
            <span className="text-white/90 font-medium">Chào mừng trở lại!</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Xin chào, {user?.name}! 👋
          </h1>
          <p className="text-white/90 text-lg max-w-2xl">
            Khám phá những sản phẩm mới nhất và quản lý đơn hàng của bạn một cách dễ dàng
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/user/products">
              <Button className="bg-white text-primary-600 hover:bg-white/90">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Mua sắm ngay
              </Button>
            </Link>
            <Link to="/user/orders">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <Package className="w-5 h-5 mr-2" />
                Đơn hàng
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary-500"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1 font-medium">Tổng đơn hàng</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {stats.totalOrders}
              </h3>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600">
              <Package className="w-8 h-8" />
            </div>
          </div>
        </Card>

        <Card
          className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-500"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1 font-medium">Đang xử lý</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {stats.pendingOrders}
              </h3>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </Card>

        <Card
          className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-500"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1 font-medium">Đã chi tiêu</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('vi-VN', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(stats.totalSpent)}₫
              </h3>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-100 to-green-200 text-green-600">
              <ShoppingBag className="w-8 h-8" />
            </div>
          </div>
        </Card>

        <Card
          className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-rose-500"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <Link to="/user/cart" className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1 font-medium">Giỏ hàng</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {cartCount}
              </h3>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600">
              <ShoppingCart className="w-8 h-8" />
            </div>
          </Link>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card data-aos="fade-up" data-aos-delay="500">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Đơn hàng gần đây
            </h2>
            <p className="text-gray-600 text-sm">Theo dõi trạng thái đơn hàng của bạn</p>
          </div>
          <Link to="/user/orders">
            <Button variant="outline" size="sm">
              Xem tất cả →
            </Button>
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Bạn chưa có đơn hàng nào</p>
            <Link to="/user/products">
              <Button>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Bắt đầu mua sắm
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order, index) => (
              <Link
                key={order.id}
                to={`/user/orders/${order.id}`}
                data-aos="fade-right"
                data-aos-delay={index * 100}
              >
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-primary-200 group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl group-hover:scale-110 transition-transform">
                      <Package className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">#{order.order_number}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('vi-VN')} • {order.items.length} sản phẩm
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg mb-1">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(order.total)}
                      </p>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <Eye className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Featured Products */}
      <div data-aos="fade-up" data-aos-delay="600">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Sản phẩm nổi bật
            </h2>
            <p className="text-gray-600 text-sm">Những sản phẩm được yêu thích nhất</p>
          </div>
          <Link to="/user/products">
            <Button variant="outline" size="sm">
              Xem thêm →
            </Button>
          </Link>
        </div>
        
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {displayProducts.map((product, index) => (
              <div
                key={product.id}
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
