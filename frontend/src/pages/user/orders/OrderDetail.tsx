import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, XCircle, Check, Clock, Truck, Home } from 'lucide-react';
import { useOrderStore } from '../../../store/orderStore';
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

const statusTimeline = [
  { key: 'pending', label: 'Đặt hàng', icon: Package },
  { key: 'confirmed', label: 'Xác nhận', icon: Check },
  { key: 'processing', label: 'Xử lý', icon: Clock },
  { key: 'shipped', label: 'Giao hàng', icon: Truck },
  { key: 'delivered', label: 'Hoàn thành', icon: Home },
];

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

  useEffect(() => {
    if (currentOrder) {
      console.log('Order data:', currentOrder);
      console.log('Order items:', currentOrder.items);
      console.log('Total amount:', currentOrder.total_amount);
      console.log('Items count:', currentOrder.items?.length);
    }
  }, [currentOrder]);

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <Card className="text-center py-16" data-aos="fade-up">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
        <Button onClick={() => navigate('/user/orders')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>
      </Card>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(currentOrder.status);
  const currentStatusIndex = statusTimeline.findIndex(s => s.key === currentOrder.status);
  const isCancelled = currentOrder.status === 'cancelled';

  // Parse address if it's a JSON string
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

  const shippingAddress = parseAddress(currentOrder.shipping_address);
  const billingAddress = parseAddress(currentOrder.billing_address);

  // Get payment method label
  const getPaymentMethodLabel = (method: string | null) => {
    if (!method || method === 'cash_on_delivery') return 'Thanh toán khi nhận hàng (COD)';
    if (method === 'bank_transfer') return 'Chuyển khoản ngân hàng';
    if (method === 'credit_card') return 'Thẻ tín dụng';
    if (method === 'debit_card') return 'Thẻ ghi nợ';
    if (method === 'paypal') return 'PayPal';
    return 'Không xác định';
  };

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/user/orders')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        data-aos="fade-right"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Quay lại</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4" data-aos="fade-down">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Đơn hàng #{currentOrder.order_number}
          </h1>
          <p className="text-gray-600">
            Đặt ngày: {new Date(currentOrder.created_at).toLocaleString('vi-VN')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${statusColors[currentOrder.status]}`}>
            {statusLabels[currentOrder.status]}
          </span>
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:border-red-300"
              onClick={() => setShowCancelDialog(true)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Hủy đơn hàng
            </Button>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <Card data-aos="fade-up">
          <h2 className="text-xl font-bold mb-6">Trạng thái đơn hàng</h2>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-8 left-0 w-full h-1 bg-gray-200">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                style={{ width: `${(currentStatusIndex / (statusTimeline.length - 1)) * 100}%` }}
              />
            </div>

            {/* Status Steps */}
            <div className="relative grid grid-cols-5 gap-2">
              {statusTimeline.map((status, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const Icon = status.icon;

                return (
                  <div key={status.key} className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-primary-200 scale-110' : ''}`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <p className={`text-xs sm:text-sm font-medium text-center ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                      {status.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card data-aos="fade-right">
            <h2 className="text-xl font-bold mb-6">Sản phẩm đã đặt</h2>
            {currentOrder.items && currentOrder.items.length > 0 ? (
              <div className="space-y-4">
                {currentOrder.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                    <img
                      src={item.product.images && item.product.images.length > 0
                        ? getImageUrl(item.product.images[0].image_url || item.product.images[0].url)
                        : getPlaceholderImage()}
                      alt={item.product.name}
                      onError={(e) => e.currentTarget.src = getPlaceholderImage()}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">
                      {item.product?.name || item.product_name || 'N/A'}
                    </h3>
                    {item.product?.brand && (
                      <p className="text-sm text-gray-500 mb-2">{item.product.brand.name}</p>
                    )}
                    <p className="text-sm text-gray-600">Số lượng: x{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900 mb-1">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(item.unit_price || item.price || 0)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tổng: {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(item.total_price || item.subtotal || 0)}
                    </p>
                  </div>
                </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Không có sản phẩm trong đơn hàng</p>
              </div>
            )}
          </Card>

          {/* Addresses */}
          <Card data-aos="fade-right" data-aos-delay="100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary-100 rounded-xl">
                <MapPin className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold">Địa chỉ</h2>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Địa chỉ giao hàng</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 whitespace-pre-line">
                  {shippingAddress}
                </p>
              </div>
            </div>
          </Card>

          {currentOrder.notes && (
            <Card data-aos="fade-right" data-aos-delay="200">
              <h2 className="text-xl font-bold mb-3">Ghi chú</h2>
              <p className="text-gray-600 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                {currentOrder.notes}
              </p>
            </Card>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6" data-aos="fade-left">
            <Card>
              <h2 className="text-xl font-bold mb-6">Tổng đơn hàng</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-bold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(parseFloat(currentOrder.total_amount?.toString() || '0'))}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
                <div className="bg-gradient-to-r from-primary-50 to-rose-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(parseFloat(currentOrder.total_amount?.toString() || '0'))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="font-bold">Thanh toán</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="font-medium">
                      {getPaymentMethodLabel(currentOrder.payment_method)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span
                      className={`font-medium ${
                        currentOrder.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      {currentOrder.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full" data-aos="zoom-in">
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
