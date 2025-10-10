import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import type { Product } from '../../types';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageUtils';
import { ImageWithSkeleton } from '../ui/ImageWithSkeleton';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const displayPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;

  return (
    <Link to={`/user/products/${product.slug}`} className="group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square bg-white overflow-hidden">
          <ImageWithSkeleton
            src={product.primary_image_url 
              ? getImageUrl(product.primary_image_url)
              : (product.images && product.images.length > 0 
                  ? getImageUrl(product.images[0].image_url || product.images[0].url)
                  : getPlaceholderImage())}
            alt={product.name}
            fallbackSrc={getPlaceholderImage()}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            skeletonClassName="rounded-t-xl"
          />
          
          {hasDiscount && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              -{Math.round(((product.price - product.sale_price!) / product.price) * 100)}%
            </div>
          )}
          
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Hết hàng</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors text-base">
            {product.name}
          </h3>
          
          {product.brand && (
            <p className="text-xs text-gray-500 mb-3 font-medium">{product.brand.name}</p>
          )}
          
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xl font-bold text-primary-600">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(product.price)}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                alert('Thêm vào giỏ hàng!');
              }}
              disabled={product.stock_quantity === 0}
              className="flex-1 bg-gradient-to-r from-primary-600 to-rose-500 text-white py-2.5 px-3 rounded-xl hover:from-primary-700 hover:to-rose-600 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-sm font-bold shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="w-4 h-4 inline mr-1" />
              Thêm giỏ
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                alert('Đã thêm vào yêu thích!');
              }}
              className="p-2.5 border-2 border-gray-200 rounded-xl hover:border-primary-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300"
            >
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};
