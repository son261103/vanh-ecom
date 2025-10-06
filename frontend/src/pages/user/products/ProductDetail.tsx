import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useProductStore } from '../../../store/productStore';
import { ProductCard } from '../../../components/user/ProductCard';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currentProduct, relatedProducts, isLoading, fetchProductBySlug, clearCurrentProduct } = useProductStore();

  useEffect(() => {
    if (slug) {
      fetchProductBySlug(slug);
    }
    return () => {
      clearCurrentProduct();
    };
  }, [slug]);

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
          <p className="text-gray-500">Không tìm thấy sản phẩm</p>
        </div>
      </Card>
    );
  }

  const displayPrice = currentProduct.sale_price || currentProduct.price;
  const hasDiscount = currentProduct.sale_price && currentProduct.sale_price < currentProduct.price;

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <Card padding="none">
            <div className="aspect-square bg-gray-200">
              {currentProduct.images && currentProduct.images.length > 0 ? (
                <img
                  src={currentProduct.images[0].image_url}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-rose-100 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            {currentProduct.brand && (
              <p className="text-sm text-gray-500 mb-2">{currentProduct.brand.name}</p>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentProduct.name}</h1>
            {currentProduct.category && (
              <p className="text-sm text-gray-600">
                Danh mục: <span className="text-primary-600">{currentProduct.category.name}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5" fill="currentColor" />
              ))}
            </div>
            <span className="text-sm text-gray-600">(5.0) · 123 đánh giá</span>
          </div>

          <div className="mb-6">
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
              <span className="inline-block bg-rose-100 text-rose-600 px-2 py-1 rounded text-sm font-semibold">
                Giảm {Math.round(((currentProduct.price - currentProduct.sale_price!) / currentProduct.price) * 100)}%
              </span>
            )}
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">Tình trạng:</p>
            {currentProduct.stock_quantity > 0 ? (
              <span className="text-green-600 font-medium">
                Còn hàng ({currentProduct.stock_quantity} sản phẩm)
              </span>
            ) : (
              <span className="text-red-600 font-medium">Hết hàng</span>
            )}
          </div>

          <div className="flex gap-3 mb-8">
            <Button
              size="lg"
              className="flex-1"
              disabled={currentProduct.stock_quantity === 0}
              onClick={() => alert('Thêm vào giỏ hàng!')}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Thêm vào giỏ hàng
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => alert('Đã thêm vào yêu thích!')}
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>

          <Card className="bg-gray-50">
            <h3 className="font-semibold mb-2">Mô tả sản phẩm</h3>
            <p className="text-gray-700 whitespace-pre-line">{currentProduct.description}</p>
          </Card>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
