import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, Package } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { getImageUrl, getPlaceholderImage } from '../../../utils/imageUtils';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, isLoading, fetchCart, updateCartItem, removeFromCart, clearCart, applyDiscount } = useCartStore();
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

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

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setIsApplyingDiscount(true);
    const success = await applyDiscount(discountCode);
    if (success) {
      setDiscountCode('');
    }
    setIsApplyingDiscount(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto" data-aos="fade-up">
        <Card className="text-center py-16">
          <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Hãy khám phá và thêm sản phẩm yêu thích vào giỏ hàng nhé!
          </p>
          <Button size="lg" onClick={() => navigate('/user/products')} className="px-8">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Khám phá sản phẩm
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" data-aos="fade-down">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Giỏ hàng của bạn
          </h1>
          <p className="text-gray-600">
            Bạn có {cart.summary.total_items} sản phẩm trong giỏ hàng
          </p>
        </div>
        <Button variant="outline" onClick={handleClearCart} className="text-red-600 hover:bg-red-50 hover:border-red-300">
          <Trash2 className="w-4 h-4 mr-2" />
          Xóa tất cả
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item, index) => (
            <Card
              key={item.id}
              className="p-4 hover:shadow-lg transition-all duration-300"
              data-aos="fade-right"
              data-aos-delay={index * 100}
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <Link
                  to={`/user/products/${item.product.slug}`}
                  className="flex-shrink-0 group"
                >
                  <div className="w-28 h-28 bg-gray-200 rounded-xl overflow-hidden">
                    <img
                      src={item.product.images && item.product.images.length > 0 
                        ? getImageUrl(item.product.images[0].image_url || item.product.images[0].url)
                        : getPlaceholderImage()}
                      alt={item.product.name}
                      onError={(e) => e.currentTarget.src = getPlaceholderImage()}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/user/products/${item.product.slug}`}
                    className="font-bold text-gray-900 hover:text-primary-600 line-clamp-2 text-lg mb-2 block transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  {item.product.brand && (
                    <p className="text-sm text-gray-500 mb-2">{item.product.brand.name}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(item.product.sale_price || item.product.price)}
                    </span>
                    {item.product.sale_price && item.product.sale_price < item.product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(item.product.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Actions */}
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-bold text-lg min-w-[50px] text-center border-x-2 border-gray-300">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      disabled={item.quantity >= item.product.stock_quantity}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Tổng</p>
                    <p className="text-xl font-bold text-gray-900">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format((item.product.sale_price || item.product.price) * item.quantity)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="sticky top-4 space-y-4" data-aos="fade-left">
            {/* Discount Code */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-lg">Mã giảm giá</h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Nhập mã giảm giá"
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <Button
                  onClick={handleApplyDiscount}
                  disabled={!discountCode.trim() || isApplyingDiscount}
                  size="sm"
                >
                  {isApplyingDiscount ? 'Đang áp dụng...' : 'Áp dụng'}
                </Button>
              </div>
            </Card>

            {/* Summary */}
            <Card>
              <h2 className="text-xl font-bold mb-6">Tổng đơn hàng</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-bold text-lg">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(cart.summary.subtotal)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Số lượng:</span>
                  <span className="font-medium">{cart.summary.total_quantity} sản phẩm</span>
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
                className="w-full mb-3 shadow-lg hover:shadow-xl transition-shadow"
                size="lg"
                onClick={() => navigate('/user/checkout')}
              >
                Tiến hành thanh toán
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/user/products')}
              >
                Tiếp tục mua sắm
              </Button>
            </Card>

            {/* Trust Badges */}
            <Card className="bg-gradient-to-br from-gray-50 to-white">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Thanh toán an toàn</p>
                    <p className="text-gray-600 text-xs">Bảo mật thông tin 100%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Miễn phí vận chuyển</p>
                    <p className="text-gray-600 text-xs">Cho đơn hàng từ 500.000đ</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Đổi trả dễ dàng</p>
                    <p className="text-gray-600 text-xs">Trong vòng 7 ngày</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
