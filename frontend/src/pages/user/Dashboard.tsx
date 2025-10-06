import React from 'react';
import { ShoppingBag, Package, Heart } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';

export const UserDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const quickStats = [
    {
      title: 'Đơn hàng',
      value: '12',
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Yêu thích',
      value: '24',
      icon: Heart,
      color: 'bg-rose-100 text-rose-600',
    },
    {
      title: 'Đã mua',
      value: '45',
      icon: ShoppingBag,
      color: 'bg-primary-100 text-primary-600',
    },
  ];

  const recentOrders = [
    {
      id: 'ORD-001',
      date: '20/03/2024',
      total: '1.250.000 ₫',
      status: 'Đang giao',
      items: 3,
    },
    {
      id: 'ORD-002',
      date: '15/03/2024',
      total: '850.000 ₫',
      status: 'Hoàn thành',
      items: 2,
    },
    {
      id: 'ORD-003',
      date: '10/03/2024',
      total: '2.100.000 ₫',
      status: 'Hoàn thành',
      items: 5,
    },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Xin chào, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">
          Chào mừng bạn đến với trang cá nhân của bạn
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-4 rounded-lg ${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Đơn hàng gần đây
          </h2>
          <a href="/user/orders" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            Xem tất cả →
          </a>
        </div>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-lg">
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{order.id}</p>
                  <p className="text-sm text-gray-500">{order.date} • {order.items} sản phẩm</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 mb-1">{order.total}</p>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    order.status === 'Hoàn thành'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommended Products */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Có thể bạn quan tâm
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="group cursor-pointer"
            >
              <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-rose-100 group-hover:scale-110 transition-transform"></div>
              </div>
              <h3 className="font-medium text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                Sản phẩm {item}
              </h3>
              <p className="text-primary-600 font-semibold">450.000 ₫</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};