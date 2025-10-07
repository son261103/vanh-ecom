import React, { useEffect, useState } from 'react';
import { useProductStore } from '../../../store/productStore';
import { useCatalogStore } from '../../../store/catalogStore';
import { ProductCard } from '../../../components/user/ProductCard';
import { Pagination } from '../../../components/shared/Pagination';
import { Card } from '../../../components/ui/Card';
import { Search, SlidersHorizontal, X, Grid3x3, List, TrendingUp } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name' | 'popular';

export const ProductsPage: React.FC = () => {
  const { products, pagination, isLoading, fetchProducts, setFilters } = useProductStore();
  const { categories, brands, fetchCategories, fetchBrands } = useCatalogStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetchProducts(false);
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
      sort_by: sortBy,
      page: 1,
    });
    fetchProducts(false);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedBrand, sortBy]);

  const handlePageChange = (page: number) => {
    setFilters({ page });
    fetchProducts(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSortBy('newest');
    setFilters({});
    fetchProducts(false);
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedBrand || sortBy !== 'newest';

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" data-aos="fade-down">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Sản phẩm
          </h1>
          <p className="text-gray-600">
            Khám phá {pagination?.total || 0} sản phẩm tuyệt vời
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden p-2 bg-primary-600 text-white rounded-lg"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar - Full Width */}
      <Card data-aos="fade-up">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm sản phẩm theo tên, mô tả..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>
          <Button type="submit" size="lg" className="px-8">
            Tìm kiếm
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className={`lg:col-span-1 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          {/* Active Filters */}
          {hasActiveFilters && (
            <Card data-aos="fade-right">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Bộ lọc đang dùng</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                    "{searchTerm}"
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
                  </span>
                )}
                {selectedBrand && (
                  <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    {brands.find(b => b.id === selectedBrand)?.name}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedBrand('')} />
                  </span>
                )}
              </div>
            </Card>
          )}

          {/* Sort */}
          <Card data-aos="fade-right" data-aos-delay="100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-lg">Sắp xếp</h3>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white font-medium"
            >
              <option value="newest">Mới nhất</option>
              <option value="popular">Phổ biến nhất</option>
              <option value="price_asc">Giá thấp đến cao</option>
              <option value="price_desc">Giá cao đến thấp</option>
              <option value="name">Tên A-Z</option>
            </select>
          </Card>

          {/* Category Filter */}
          <Card data-aos="fade-right" data-aos-delay="200">
            <h3 className="font-semibold text-lg mb-4">Danh mục</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  selectedCategory === ''
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                Tất cả danh mục
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </Card>

          {/* Brand Filter */}
          <Card data-aos="fade-right" data-aos-delay="300">
            <h3 className="font-semibold text-lg mb-4">Thương hiệu</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <button
                onClick={() => setSelectedBrand('')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  selectedBrand === ''
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                Tất cả thương hiệu
              </button>
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedBrand === brand.id
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải sản phẩm...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <Card data-aos="fade-up">
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-600 mb-6">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-6 flex items-center justify-between" data-aos="fade-up">
                <p className="text-gray-600">
                  Hiển thị <span className="font-semibold text-gray-900">{products.length}</span> trong tổng số{' '}
                  <span className="font-semibold text-gray-900">{pagination?.total || 0}</span> sản phẩm
                </p>
              </div>

              {/* Products */}
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'
                    : 'space-y-6 mb-8'
                }
              >
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    data-aos={viewMode === 'grid' ? 'zoom-in' : 'fade-up'}
                    data-aos-delay={index * 50}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && (
                <div data-aos="fade-up">
                  <Pagination meta={pagination} onPageChange={handlePageChange} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
