import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, isLoading, fetchCart, updateCartItem, removeFromCart, clearCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (cartItemId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    await updateCartItem(cartItemId, newQuantity);
  };

  const handleRemove = async (cartItemId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      await removeFromCart(cartItemId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
      await clearCart();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Card className="text-center py-12">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <Button onClick={() => navigate('/user/products')}>
          Tiếp tục mua sắm
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
        <Button variant="outline" onClick={handleClearCart}>
          Xóa tất cả
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-4">
                {/* Product Image */}
                <Link to={`/user/products/${item.product.slug}`} className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0].image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-rose-100" />
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1">
                  <Link
                    to={`/user/products/${item.product.slug}`}
                    className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  {item.product.brand && (
                    <p className="text-sm text-gray-500 mt-1">{item.product.brand.name}</p>
                  )}
                  <div className="mt-2">
                    <span className="text-lg font-bold text-primary-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(item.product.sale_price || item.product.price)}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={item.quantity >= item.product.stock_quantity}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <h2 className="text-xl font-bold mb-4">Tổng đơn hàng</h2>

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
              <div className="flex justify-between text-sm text-gray-500">
                <span>Số lượng:</span>
                <span>{cart.summary.total_quantity} sản phẩm</span>
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
              className="w-full mb-3"
              size="lg"
              onClick={() => navigate('/user/checkout')}
            >
              Thanh toán
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/user/products')}
            >
              Tiếp tục mua sắm
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
