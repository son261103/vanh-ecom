import React, { useEffect, useState } from 'react';
import { useProductStore } from '../../../store/productStore';
import { useCatalogStore } from '../../../store/catalogStore';
import { ProductCard } from '../../../components/user/ProductCard';
import { Pagination } from '../../../components/shared/Pagination';
import { Card } from '../../../components/ui/Card';
import { Search } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { products, pagination, isLoading, fetchProducts, setFilters } = useProductStore();
  const { categories, brands, fetchCategories, fetchBrands } = useCatalogStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  useEffect(() => {
    fetchProducts(false); // Public products
    fetchCategories(false);
    fetchBrands(false);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    setFilters({
      search: searchTerm || undefined,
      category_id: selectedCategory || undefined,
      brand_id: selectedBrand || undefined,
      page: 1,
    });
    fetchProducts(false);
  };

  useEffect(() => {
    if (selectedCategory || selectedBrand) {
      applyFilters();
    }
  }, [selectedCategory, selectedBrand]);

  const handlePageChange = (page: number) => {
    setFilters({ page });
    fetchProducts(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sản phẩm</h1>
        <p className="text-gray-600">Khám phá tất cả sản phẩm của chúng tôi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="font-semibold text-lg mb-4">Bộ lọc</h3>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm sản phẩm..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thương hiệu
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tất cả thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : products.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
              </div>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {pagination && <Pagination meta={pagination} onPageChange={handlePageChange} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
