import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CreditCard, MapPin, Package } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { useOrderStore } from '../../../store/orderStore';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { CreateOrderData } from '../../../types';

interface CheckoutForm {
  payment_method: string;
  shipping_address: string;
  billing_address: string;
  notes?: string;
  use_same_address: boolean;
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, isLoading: cartLoading, fetchCart, validateCart, clearCart } = useCartStore();
  const { createOrder, isLoading: orderLoading } = useOrderStore();
  const [useSameAddress, setUseSameAddress] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    defaultValues: {
      payment_method: 'cod',
      use_same_address: true,
    },
  });

  const shippingAddress = watch('shipping_address');

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (useSameAddress && shippingAddress) {
      setValue('billing_address', shippingAddress);
    }
  }, [useSameAddress, shippingAddress, setValue]);

  const onSubmit = async (data: CheckoutForm) => {
    // Validate cart first
    const isValid = await validateCart();
    if (!isValid) {
      return;
    }

    const orderData: CreateOrderData = {
      payment_method: data.payment_method,
      shipping_address: data.shipping_address,
      billing_address: useSameAddress ? data.shipping_address : data.billing_address,
      notes: data.notes,
    };

    const order = await createOrder(orderData);
    if (order) {
      await clearCart();
      navigate(`/user/orders/${order.id}`);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Card className="text-center py-12">
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
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Thanh toán</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-bold">Địa chỉ giao hàng</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ *
                </label>
                <textarea
                  {...register('shipping_address', {
                    required: 'Địa chỉ giao hàng là bắt buộc',
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nhập địa chỉ giao hàng đầy đủ..."
                />
                {errors.shipping_address && (
                  <p className="mt-1 text-sm text-red-600">{errors.shipping_address.message}</p>
                )}
              </div>
            </Card>

            {/* Billing Address */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Địa chỉ thanh toán</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSameAddress}
                    onChange={(e) => setUseSameAddress(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">Giống địa chỉ giao hàng</span>
                </label>
              </div>

              {!useSameAddress && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ *
                  </label>
                  <textarea
                    {...register('billing_address', {
                      required: !useSameAddress && 'Địa chỉ thanh toán là bắt buộc',
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Nhập địa chỉ thanh toán..."
                  />
                  {errors.billing_address && (
                    <p className="mt-1 text-sm text-red-600">{errors.billing_address.message}</p>
                  )}
                </div>
              )}
            </Card>

            {/* Payment Method */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-bold">Phương thức thanh toán</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-600 transition-colors">
                  <input
                    type="radio"
                    value="cod"
                    {...register('payment_method')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-600 transition-colors">
                  <input
                    type="radio"
                    value="bank_transfer"
                    {...register('payment_method')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-medium">Chuyển khoản ngân hàng</p>
                    <p className="text-sm text-gray-600">Chuyển khoản trực tiếp qua ngân hàng</p>
                  </div>
                </label>
              </div>
            </Card>

            {/* Notes */}
            <Card>
              <h2 className="text-xl font-bold mb-4">Ghi chú</h2>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ghi chú cho đơn hàng (tùy chọn)..."
              />
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <h2 className="text-xl font-bold mb-4">Đơn hàng</h2>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b">
                    <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 && (
                        <img
                          src={item.product.images[0].image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">x{item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format((item.product.sale_price || item.product.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(cart.summary.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium">Miễn phí</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-primary-600">
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
                className="w-full"
                size="lg"
                disabled={orderLoading}
              >
                {orderLoading ? 'Đang xử lý...' : 'Đặt hàng'}
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};
