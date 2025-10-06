import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { useProductStore } from '../../../store/productStore';
import { Table } from '../../../components/shared/Table';
import { Pagination } from '../../../components/shared/Pagination';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Alert } from '../../../components/ui/Alert';
import { getImageUrl } from '../../../utils/imageUtils';

export const ProductList: React.FC = () => {
  const {
    products,
    pagination,
    isLoading,
    error,
    fetchProducts,
    deleteProduct,
    toggleProductStatus,
    toggleProductFeatured,
    clearError,
    setFilters,
  } = useProductStore();

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchTerm, page: 1 });
    fetchProducts(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) {
      try {
        await deleteProduct(id);
        alert('Xóa sản phẩm thành công!');
      } catch (error) {
        alert('Không thể xóa sản phẩm!');
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleProductStatus(id);
    } catch (error) {
      alert('Không thể cập nhật trạng thái!');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await toggleProductFeatured(id);
    } catch (error) {
      alert('Không thể cập nhật featured!');
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ page });
    fetchProducts(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Sản phẩm',
      render: (value: string, row: any) => (
        <div className="flex items-center">
          {row.primary_image || (row.images && row.images.length > 0) ? (
            <img
              src={getImageUrl(row.primary_image || row.images[0]?.url)}
              alt={value}
              className="h-12 w-12 flex-shrink-0 object-cover rounded border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23f3f4f6" width="48" height="48"/%3E%3C/svg%3E';
              }}
            />
          ) : (
            <div className="h-12 w-12 flex-shrink-0 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
              No img
            </div>
          )}
          <div className="ml-3">
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.sku}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Danh mục',
      render: (value: any) => value?.name || '-',
    },
    {
      key: 'brand',
      label: 'Thương hiệu',
      render: (value: any) => value?.name || '-',
    },
    {
      key: 'price',
      label: 'Giá',
      render: (value: number, row: any) => (
        <div>
          <div className="font-medium text-gray-900">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(value)}
          </div>
          {row.sale_price && (
            <div className="text-sm text-rose-600">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(row.sale_price)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'stock_quantity',
      label: 'Tồn kho',
      render: (value: number) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            value > 10
              ? 'bg-green-100 text-green-800'
              : value > 0
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Trạng thái',
      render: (value: boolean, row: any) => (
        <button
          onClick={() => handleToggleStatus(row.id)}
          className={`px-3 py-1 text-xs rounded-full ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Kích hoạt' : 'Vô hiệu'}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (_: any, row: any) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleToggleFeatured(row.id)}
            className={`p-1 rounded hover:bg-gray-100 ${
              row.is_featured ? 'text-yellow-500' : 'text-gray-400'
            }`}
            title={row.is_featured ? 'Bỏ nổi bật' : 'Đặt nổi bật'}
          >
            <Star className="w-4 h-4" fill={row.is_featured ? 'currentColor' : 'none'} />
          </button>
          <Link
            to={`/admin/products/edit/${row.id}`}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Chỉnh sửa"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => handleDelete(row.id, row.name)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý sản phẩm</h1>
        <p className="text-gray-600">Quản lý tất cả sản phẩm trong hệ thống</p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={clearError} />
        </div>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-1 sm:w-64"
            />
            <Button type="submit">Tìm</Button>
          </form>
          <Link to="/admin/products/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </Link>
        </div>

        <Table columns={columns} data={products} isLoading={isLoading} emptyMessage="Không có sản phẩm nào" />

        {pagination && <Pagination meta={pagination} onPageChange={handlePageChange} />}
      </Card>
    </div>
  );
};
