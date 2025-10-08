import { ShoppingCart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  image: string;
  description: string;
  category_name: string;
  brand_name: string;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  
  const displayPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };
  
  const handleViewProduct = () => {
    navigate(`/user/products/${product.slug}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100 aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
          }}
        />
        
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
            -{Math.round(((product.price - product.sale_price!) / product.price) * 100)}%
          </div>
        )}
        
        {product.stock_quantity < 10 && product.stock_quantity > 0 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
            Chỉ còn {product.stock_quantity}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand & Category */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
            {product.brand_name}
          </span>
          <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
            {product.category_name}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[48px]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-blue-600">
            {formatPrice(displayPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-3">
          {product.stock_quantity > 0 ? (
            <span className="text-xs text-green-600 font-medium">
              ✓ Còn hàng
            </span>
          ) : (
            <span className="text-xs text-red-600 font-medium">
              ✗ Hết hàng
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleViewProduct}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Eye className="w-4 h-4" />
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};
