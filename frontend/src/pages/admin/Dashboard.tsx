import React from 'react';
import { ShoppingBag, Users, Package, DollarSign } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export const AdminDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Tổng doanh thu',
      value: '125.000.000 ₫',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
      change: '+12.5%',
    },
    {
      title: 'Đơn hàng',
      value: '352',
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
      change: '+8.2%',
    },
    {
      title: 'Sản phẩm',
      value: '1,234',
      icon: ShoppingBag,
      color: 'bg-primary-100 text-primary-600',
      change: '+5.4%',
    },
    {
      title: 'Người dùng',
      value: '2,543',
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      change: '+15.3%',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Tổng quan về hệ thống của bạn</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </h3>
                <span className="text-green-600 text-sm font-medium">
                  {stat.change}
                </span>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Đơn hàng gần đây
          </h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">Đơn hàng #{1000 + item}</p>
                  <p className="text-sm text-gray-500">Nguyễn Văn A</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">1.250.000 ₫</p>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
                    Hoàn thành
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sản phẩm bán chạy
          </h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Sản phẩm {item}</p>
                    <p className="text-sm text-gray-500">123 đã bán</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary-600">450.000 ₫</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};