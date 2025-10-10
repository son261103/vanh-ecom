import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Plus, Minus, Truck, Shield, RefreshCw, ChevronLeft, Check, Package } from 'lucide-react';
import { useProductStore } from '../../../store/productStore';
import { useCartStore } from '../../../store/cartStore';
import { ProductCard } from '../../../components/user/ProductCard';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { getImageUrl, getPlaceholderImage } from '../../../utils/imageUtils';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string}>();
  const navigate = useNavigate();
  const { currentProduct, relatedProducts, isLoading, fetchProductBySlug, clearCurrentProduct } = useProductStore();
  const { addToCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProductBySlug(slug);
      window.scrollTo(0, 0);
    }
    return () => {
      clearCurrentProduct();
    };
  }, [slug]);

  const handleAddToCart = async () => {
    if (!currentProduct) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart({
        product_id: currentProduct.id,
        quantity,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/user/cart');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <Card>
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Không tìm thấy sản phẩm</p>
          <Button onClick={() => navigate('/user/products')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </Card>
    );
  }

  const displayPrice = currentProduct.sale_price || currentProduct.price;
  const hasDiscount = currentProduct.sale_price && currentProduct.sale_price < currentProduct.price;
  const discountPercent = hasDiscount 
    ? Math.round(((currentProduct.price - currentProduct.sale_price!) / currentProduct.price) * 100)
    : 0;

  const images = currentProduct.images || [];
  const selectedImage = images[selectedImageIndex] || null;

  const features = [
    { icon: Truck, text: 'Miễn phí vận chuyển cho đơn hàng trên 500.000đ' },
    { icon: Shield, text: 'Bảo hành chính hãng' },
    { icon: RefreshCw, text: 'Đổi trả trong 7 ngày' },
  ];

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600" data-aos="fade-right">
        <button onClick={() => navigate('/user/products')} className="hover:text-primary-600">
          Sản phẩm
        </button>
        <span>/</span>
        {currentProduct.category && (
          <>
            <span>{currentProduct.category.name}</span>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 font-medium">{currentProduct.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images Section */}
        <div className="space-y-4 max-w-xl mx-auto lg:mx-0" data-aos="fade-right">
          <Card padding="none" className="overflow-hidden">
            <div className="aspect-square bg-white relative group">
              {selectedImage ? (
                <>
                  <img
                    src={getImageUrl(selectedImage.image_url || selectedImage.url)}
                    alt={currentProduct.name}
                    onError={(e) => e.currentTarget.src = getPlaceholderImage()}
                    className="w-full h-full object-contain p-6"
                  />
                  {hasDiscount && (
                    <div className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg">
                      -{discountPercent}%
                    </div>
                  )}
                  {currentProduct.is_featured && (
                    <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1.5 rounded-full font-medium text-sm shadow-lg flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      Nổi bật
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-rose-50">
                  <Package className="w-24 h-24 text-gray-300" />
                </div>
              )}
            </div>
          </Card>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-primary-600 ring-2 ring-primary-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={getImageUrl(img.image_url || img.url)}
                    alt={`${currentProduct.name} ${index + 1}`}
                    onError={(e) => e.currentTarget.src = getPlaceholderImage()}
                    className="w-full h-full object-contain p-2"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="space-y-6" data-aos="fade-left">
          {/* Brand */}
          {currentProduct.brand && (
            <div className="inline-block bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-gray-700">{currentProduct.brand.name}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              {currentProduct.name}
            </h1>
            {currentProduct.category && (
              <p className="text-gray-600 flex items-center gap-2">
                Danh mục:
                <span className="text-primary-600 font-medium">{currentProduct.category.name}</span>
              </p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 pb-6 border-b">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5" fill="currentColor" />
              ))}
            </div>
            <span className="text-sm text-gray-600">(5.0) · 123 đánh giá</span>
          </div>

          {/* Price */}
          <div className="bg-gradient-to-r from-primary-50 to-rose-50 p-6 rounded-2xl">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-bold text-primary-600">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-gray-400 line-through">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(currentProduct.price)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <div className="flex items-center gap-2">
                <span className="inline-block bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Tiết kiệm {discountPercent}%
                </span>
                <span className="text-gray-600 text-sm">
                  = {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(currentProduct.price - displayPrice)}
                </span>
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-3 py-4 px-5 bg-gray-50 rounded-xl">
            <span className="text-gray-700 font-medium">Tình trạng:</span>
            {currentProduct.stock_quantity > 0 ? (
              <>
                <span className="flex items-center gap-2 text-green-600 font-bold">
                  <Check className="w-5 h-5" />
                  Còn hàng
                </span>
                <span className="text-gray-600">
                  ({currentProduct.stock_quantity} sản phẩm)
                </span>
              </>
            ) : (
              <span className="text-red-600 font-bold">Hết hàng</span>
            )}
          </div>

          {/* Quantity Selector */}
          {currentProduct.stock_quantity > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Số lượng:
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 py-3 font-bold text-lg min-w-[60px] text-center border-x-2 border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentProduct.stock_quantity, quantity + 1))}
                    className="px-4 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    disabled={quantity >= currentProduct.stock_quantity}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-gray-600">
                  Tối đa {currentProduct.stock_quantity} sản phẩm
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              size="lg"
              className="flex-1 shadow-lg hover:shadow-xl transition-shadow"
              disabled={currentProduct.stock_quantity === 0 || isAddingToCart}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 transition-colors"
              onClick={() => alert('Chức năng yêu thích đang phát triển')}
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>

          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-primary-600 to-rose-600 hover:from-primary-700 hover:to-rose-700 shadow-lg"
            disabled={currentProduct.stock_quantity === 0}
            onClick={handleBuyNow}
          >
            Mua ngay
          </Button>

          {/* Features */}
          <div className="space-y-3 pt-4 border-t">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <feature.icon className="w-5 h-5 text-primary-600" />
                </div>
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <Card data-aos="fade-up">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả sản phẩm</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {currentProduct.description}
          </p>
        </div>
      </Card>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div data-aos="fade-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Sản phẩm liên quan</h2>
              <p className="text-gray-600 text-sm">Các sản phẩm tương tự bạn có thể quan tâm</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product, index) => (
              <div
                key={product.id}
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
