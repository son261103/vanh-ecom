import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useCatalogStore } from '../../../store/catalogStore';
import { Table } from '../../../components/shared/Table';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Alert } from '../../../components/ui/Alert';

export const CategoryList: React.FC = () => {
  const {
    categories,
    isLoading,
    error,
    fetchCategories,
    deleteCategory,
    toggleCategoryStatus,
    clearError,
  } = useCatalogStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(categories);

  useEffect(() => {
    fetchCategories(true);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredCategories(
        categories.filter((cat) =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) {
      try {
        await deleteCategory(id);
        alert('Xóa danh mục thành công!');
      } catch (error) {
        alert('Không thể xóa danh mục!');
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleCategoryStatus(id);
    } catch (error) {
      alert('Không thể cập nhật trạng thái!');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Tên danh mục',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.slug}</div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (value: string) => (
        <div className="max-w-md truncate text-gray-600">
          {value || '-'}
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Trạng thái',
      render: (value: boolean, row: any) => (
        <button
          onClick={() => handleToggleStatus(row.id)}
          className={`px-3 py-1 text-xs rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Kích hoạt' : 'Vô hiệu'}
        </button>
      ),
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (_: any, row: any) => (
        <div className="flex items-center space-x-2">
          <Link
            to={`/admin/categories/edit/${row.id}`}
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý danh mục</h1>
        <p className="text-gray-600">Quản lý tất cả danh mục sản phẩm</p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={clearError} />
        </div>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm danh mục..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <Link to="/admin/categories/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm danh mục
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào'}
            </p>
          </div>
        ) : (
          <Table columns={columns} data={filteredCategories} />
        )}
      </Card>

      <div className="mt-4 text-sm text-gray-600">
        Tổng số: <span className="font-semibold">{filteredCategories.length}</span> danh mục
      </div>
    </div>
  );
};
