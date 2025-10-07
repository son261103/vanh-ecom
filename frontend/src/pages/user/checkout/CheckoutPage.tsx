import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CreditCard, MapPin, Package, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../../../store/cartStore';
import { useOrderStore } from '../../../store/orderStore';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { CreateOrderData } from '../../../types';
import { getImageUrl, getPlaceholderImage } from '../../../utils/imageUtils';

interface AddressData {
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface CheckoutForm {
  payment_method: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, isLoading: cartLoading, fetchCart, validateCart, clearCart } = useCartStore();
  const { createOrder, isLoading: orderLoading } = useOrderStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    defaultValues: {
      payment_method: 'cash_on_delivery',
    },
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const onSubmit = async (data: CheckoutForm) => {
    const isValid = await validateCart();
    if (!isValid) {
      return;
    }

    // Structure address data as backend expects
    const addressData: AddressData = {
      full_name: data.full_name,
      phone: data.phone,
      address_line_1: data.address,
      city: data.city,
      state: data.city, // Use city as state for simplicity
      postal_code: '10000', // Default postal code
      country: 'VN', // Vietnam
    };

    const orderData: CreateOrderData = {
      payment_method: data.payment_method,
      shipping_address: addressData as any,
      billing_address: addressData as any, // Same as shipping address
      notes: data.notes,
    };

    const order = await createOrder(orderData);
    if (order) {
      console.log('Order created:', order);
      await clearCart();
      // Navigate using order_number if id is not available
      const orderIdentifier = order.id || order.order_number;
      if (orderIdentifier) {
        navigate(`/user/orders/${orderIdentifier}`);
      } else {
        toast.error('Order created but navigation failed');
        navigate('/user/orders');
      }
    }
  };

  if (cartLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Card className="text-center py-16" data-aos="fade-up">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
        <Button onClick={() => navigate('/user/products')}>
          Mua sắm ngay
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-6">
      {/* Header */}
      <div data-aos="fade-down">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Thanh toán
        </h1>
        <p className="text-gray-600">
          Hoàn tất đơn hàng của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card data-aos="fade-right">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <MapPin className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Địa chỉ giao hàng</h2>
                  <p className="text-sm text-gray-600">Nhập địa chỉ nhận hàng của bạn</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      {...register('full_name', {
                        required: 'Họ và tên là bắt buộc',
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.full_name && (
                      <div className="mt-2 flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errors.full_name.message}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      {...register('phone', {
                        required: 'Số điện thoại là bắt buộc',
                        pattern: {
                          value: /^[0-9]{10,11}$/,
                          message: 'Số điện thoại không hợp lệ',
                        },
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="0912345678"
                    />
                    {errors.phone && (
                      <div className="mt-2 flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errors.phone.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ chi tiết *
                  </label>
                  <textarea
                    {...register('address', {
                      required: 'Địa chỉ là bắt buộc',
                    })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Số nhà, tên đường, phường/xã..."
                  />
                  {errors.address && (
                    <div className="mt-2 flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.address.message}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố *
                  </label>
                  <input
                    type="text"
                    {...register('city', {
                      required: 'Tỉnh/Thành phố là bắt buộc',
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Hà Nội, Hồ Chí Minh..."
                  />
                  {errors.city && (
                    <div className="mt-2 flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.city.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card data-aos="fade-right" data-aos-delay="200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <CreditCard className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Phương thức thanh toán</h2>
                  <p className="text-sm text-gray-600">Chọn cách thanh toán phù hợp</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-4 p-5 border-2 border-primary-500 bg-primary-50 rounded-xl cursor-pointer">
                  <input
                    type="radio"
                    value="cash_on_delivery"
                    {...register('payment_method')}
                    className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500"
                    checked
                    readOnly
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1">
                      Thanh toán khi nhận hàng (COD)
                    </p>
                    <p className="text-sm text-gray-600">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-primary-600" />
                </label>
              </div>
            </Card>

            {/* Notes */}
            <Card data-aos="fade-right" data-aos-delay="300">
              <h2 className="text-xl font-bold mb-4">Ghi chú đơn hàng</h2>
              <textarea
                {...register('notes')}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)..."
              />
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4" data-aos="fade-left">
              <Card>
                <h2 className="text-xl font-bold mb-6">Đơn hàng của bạn</h2>

                <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-2">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b last:border-b-0">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img
                            src={getImageUrl(item.product.images[0].url)}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = getPlaceholderImage();
                            }}
                          />
                        ) : (
                          <img
                            src={getPlaceholderImage()}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-600">x{item.quantity}</p>
                        <p className="text-sm font-bold text-primary-600">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format((item.product.sale_price || item.product.price) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-bold">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(cart.summary.subtotal)}
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
                        }).format(cart.summary.subtotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full shadow-lg hover:shadow-xl transition-shadow"
                  size="lg"
                  disabled={orderLoading}
                >
                  {orderLoading ? 'Đang xử lý...' : 'Đặt hàng'}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Bằng việc đặt hàng, bạn đồng ý với{' '}
                  <button className="text-primary-600 hover:underline">Điều khoản sử dụng</button>
                </p>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
