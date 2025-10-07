import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, User, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminOrderService } from '../../../services/adminOrderService';
import type { Order, OrderStatus } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { getImageUrl, getPlaceholderImage } from '../../../utils/imageUtils';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  processing: 'bg-purple-100 text-purple-800 border-purple-300',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  delivered: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  completed: 'bg-teal-100 text-teal-800 border-teal-300',
  refunded: 'bg-orange-100 text-orange-800 border-orange-300',
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

const statusOptions: { value: string; label: string }[] = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipped', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'refunded', label: 'Hoàn tiền' },
];

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const data = await adminOrderService.getOrderById(id!);
      setOrder(data);
      setSelectedStatus(data.status);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Không thể tải thông tin đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order) return;

    setIsUpdating(true);
    try {
      await adminOrderService.updateStatus(order.id, selectedStatus);
      toast.success('Cập nhật trạng thái thành công');
      setShowStatusModal(false);
      fetchOrder(); // Refresh order data
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setIsUpdating(false);
    }
  };

  const parseAddress = (addressData: any) => {
    if (typeof addressData === 'string') {
      try {
        const parsed = JSON.parse(addressData);
        return `${parsed.full_name}\n${parsed.phone}\n${parsed.address_line_1}\n${parsed.city}, ${parsed.state} ${parsed.postal_code}\n${parsed.country}`;
      } catch {
        return addressData;
      }
    }
    return addressData;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <Card className="text-center py-16">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
        <Button onClick={() => navigate('/admin/orders')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>
      </Card>
    );
  }

  const shippingAddress = parseAddress(order.shipping_address);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Đơn hàng #{order.order_number}
            </h1>
            <p className="text-gray-600">
              Đặt ngày: {new Date(order.created_at).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${statusColors[order.status]}`}>
            {statusLabels[order.status]}
          </span>
          <Button onClick={() => setShowStatusModal(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Cập nhật trạng thái
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold">Thông tin khách hàng</h2>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Tên:</span> {order.user?.full_name || 'N/A'}</p>
              <p><span className="font-medium">Email:</span> {order.user?.email || 'N/A'}</p>
              <p><span className="font-medium">Số điện thoại:</span> {order.user?.phone || 'N/A'}</p>
            </div>
          </Card>

          {/* Order Items */}
          <Card>
            <h2 className="text-xl font-bold mb-4">Sản phẩm đã đặt</h2>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      <img
                        src={item.product?.images && item.product.images.length > 0
                          ? getImageUrl(item.product.images[0].image_url || item.product.images[0].url)
                          : getPlaceholderImage()}
                        alt={item.product?.name || 'Product'}
                        onError={(e) => e.currentTarget.src = getPlaceholderImage()}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{item.product?.name || 'N/A'}</h3>
                      <p className="text-sm text-gray-600">Số lượng: x{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(item.unit_price || item.price || 0)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Tổng: {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(item.subtotal || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>Không có sản phẩm</p>
              </div>
            )}
          </Card>

          {/* Shipping Address */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold">Địa chỉ giao hàng</h2>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 whitespace-pre-line">{shippingAddress}</p>
            </div>
          </Card>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-bold mb-4">Tổng đơn hàng</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-bold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(parseFloat(order.total_amount?.toString() || '0'))}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium text-green-600">Miễn phí</span>
              </div>
              <div className="bg-gradient-to-r from-primary-50 to-rose-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Tổng cộng:</span>
                  <span className="text-xl font-bold text-primary-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(parseFloat(order.total_amount?.toString() || '0'))}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold">Thanh toán</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-medium">
                    {order.payment_method === 'cash_on_delivery' ? 'COD' : order.payment_method || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Cập nhật trạng thái đơn hàng</h2>
            <p className="text-gray-600 mb-4">
              Chọn trạng thái mới cho đơn hàng #{order.order_number}
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowStatusModal(false)}
                disabled={isUpdating}
              >
                Hủy
              </Button>
              <Button
                className="flex-1"
                onClick={handleUpdateStatus}
                disabled={isUpdating}
              >
                {isUpdating ? 'Đang cập nhật...' : 'Xác nhận'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
