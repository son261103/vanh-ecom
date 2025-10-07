import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, Search, Filter } from 'lucide-react';
import { useOrderStore } from '../../../store/orderStore';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Pagination } from '../../../components/shared/Pagination';
import { getImageUrl, getPlaceholderImage } from '../../../utils/imageUtils';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-purple-100 text-purple-800 border-purple-200',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-teal-100 text-teal-800 border-teal-200',
  refunded: 'bg-orange-100 text-orange-800 border-orange-200',
};

const statusLabels: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  completed: 'Hoàn thành',
  refunded: 'Hoàn tiền',
};

type StatusFilter = 'all' | keyof typeof statusColors;

export const OrdersPage: React.FC = () => {
  const { orders, pagination, isLoading, fetchOrders } = useOrderStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders(1);
  }, []);

  const handlePageChange = (page: number) => {
    fetchOrders(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-6">
      {/* Header */}
      <div data-aos="fade-down">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Đơn hàng của tôi
        </h1>
        <p className="text-gray-600">
          Quản lý và theo dõi đơn hàng của bạn
        </p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-aos="fade-up">
        <Card>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo mã đơn hàng..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <Card data-aos="fade-up" data-aos-delay="100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-lg">Lọc theo trạng thái</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả ({statusCounts.all})
          </button>
          {Object.entries(statusLabels).map(([status, label]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as StatusFilter)}
              className={`px-4 py-2 rounded-lg font-medium border-2 transition-all ${
                statusFilter === status
                  ? statusColors[status as keyof typeof statusColors].replace('100', '200')
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label} ({statusCounts[status as keyof typeof statusCounts]})
            </button>
          ))}
        </div>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-16" data-aos="fade-up">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng'}
          </h2>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Bạn chưa có đơn hàng nào'
            }
          </p>
          {!(searchTerm || statusFilter !== 'all') && (
            <Link to="/user/products">
              <Button>Mua sắm ngay</Button>
            </Link>
          )}
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <Card
                key={order.id}
                className="hover:shadow-lg transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Đơn hàng #{order.order_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Đặt ngày: {new Date(order.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={item.product?.images && item.product.images.length > 0
                            ? getImageUrl(item.product.images[0].image_url || item.product.images[0].url)
                            : getPlaceholderImage()}
                          alt={item.product?.name || item.product_name || 'Product'}
                          onError={(e) => e.currentTarget.src = getPlaceholderImage()}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 line-clamp-2 mb-1">
                          {item.product?.name || item.product_name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">x{item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format((item.unit_price || item.price || 0) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-sm text-gray-600 pl-3">
                      Và {order.items.length - 2} sản phẩm khác...
                    </p>
                  )}
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tổng tiền:</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(parseFloat(order.total_amount?.toString() || '0'))}
                    </p>
                  </div>
                  <Link to={`/user/orders/${order.id}`}>
                    <Button variant="outline" className="group">
                      <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {pagination && (
            <div data-aos="fade-up">
              <Pagination meta={pagination} onPageChange={handlePageChange} />
            </div>
          )}
        </>
      )}
    </div>
  );
};
