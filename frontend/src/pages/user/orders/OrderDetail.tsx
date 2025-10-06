import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, XCircle } from 'lucide-react';
import { useOrderStore } from '../../../store/orderStore';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

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

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrder, isLoading, fetchOrderById, cancelOrder } = useOrderStore();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
  }, [id]);

  const handleCancelOrder = async () => {
    if (id) {
      const success = await cancelOrder(id, cancelReason);
      if (success) {
        setShowCancelDialog(false);
        fetchOrderById(id);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <Card className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
        <Button onClick={() => navigate('/user/orders')}>
          Quay lại danh sách
        </Button>
      </Card>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(currentOrder.status);

  return (
    <div>
      <button
        onClick={() => navigate('/user/orders')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đơn hàng #{currentOrder.order_number}
          </h1>
          <p className="text-gray-600">
            Đặt ngày: {new Date(currentOrder.created_at).toLocaleString('vi-VN')}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
              statusColors[currentOrder.status]
            }`}
          >
            {statusLabels[currentOrder.status]}
          </span>
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-red-600 hover:text-red-700"
              onClick={() => setShowCancelDialog(true)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Hủy đơn hàng
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <h2 className="text-xl font-bold mb-4">Sản phẩm</h2>
            <div className="space-y-4">
              {currentOrder.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
                    {item.product.images && item.product.images.length > 0 && (
                      <img
                        src={item.product.images[0].image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    {item.product.brand && (
                      <p className="text-sm text-gray-500">{item.product.brand.name}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">Số lượng: x{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(item.price)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tổng:{' '}
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Addresses */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold">Địa chỉ</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Địa chỉ giao hàng</h3>
                <p className="text-gray-600 whitespace-pre-line">{currentOrder.shipping_address}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Địa chỉ thanh toán</h3>
                <p className="text-gray-600 whitespace-pre-line">{currentOrder.billing_address}</p>
              </div>
            </div>
          </Card>

          {currentOrder.notes && (
            <Card>
              <h2 className="text-xl font-bold mb-2">Ghi chú</h2>
              <p className="text-gray-600 whitespace-pre-line">{currentOrder.notes}</p>
            </Card>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <h2 className="text-xl font-bold mb-4">Tổng đơn hàng</h2>

            <div className="space-y-3 mb-4 pb-4 border-b">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(currentOrder.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(currentOrder.shipping_fee)}
                </span>
              </div>
              {currentOrder.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span className="font-medium">
                    -{new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(currentOrder.discount)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Tổng cộng:</span>
              <span className="text-primary-600">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(currentOrder.total)}
              </span>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium">Thanh toán</h3>
              </div>
              <p className="text-gray-600 mb-1">
                Phương thức:{' '}
                {currentOrder.payment_method === 'cod' ? 'COD' : 'Chuyển khoản'}
              </p>
              <p className="text-gray-600">
                Trạng thái:{' '}
                <span
                  className={
                    currentOrder.payment_status === 'paid'
                      ? 'text-green-600 font-medium'
                      : 'text-yellow-600 font-medium'
                  }
                >
                  {currentOrder.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Hủy đơn hàng</h2>
            <p className="text-gray-600 mb-4">
              Bạn có chắc muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do hủy (tùy chọn)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nhập lý do hủy đơn hàng..."
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelDialog(false)}
              >
                Không
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleCancelOrder}
              >
                Xác nhận hủy
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
