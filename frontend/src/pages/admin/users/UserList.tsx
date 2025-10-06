import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Shield, User as UserIcon } from 'lucide-react';
import { useAdminUserStore } from '../../../store/adminUserStore';
import { Table } from '../../../components/shared/Table';
import { Pagination } from '../../../components/shared/Pagination';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Alert } from '../../../components/ui/Alert';

export const UserList: React.FC = () => {
  const {
    users,
    pagination,
    filters,
    isLoading,
    error,
    fetchUsers,
    deleteUser,
    toggleUserStatus,
    setFilters,
    clearError,
  } = useAdminUserStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchTerm, page: 1, role: roleFilter !== 'all' ? roleFilter : undefined });
    fetchUsers();
  };

  const handleRoleFilterChange = (role: 'all' | 'admin' | 'user') => {
    setRoleFilter(role);
    setFilters({ role: role !== 'all' ? role : undefined, page: 1 });
    fetchUsers();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa người dùng "${name}"?`)) {
      try {
        await deleteUser(id);
        alert('Xóa người dùng thành công!');
      } catch (error) {
        alert('Không thể xóa người dùng!');
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleUserStatus(id);
    } catch (error) {
      alert('Không thể cập nhật trạng thái!');
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ page });
    fetchUsers();
  };

  const columns = [
    {
      key: 'name',
      label: 'Người dùng',
      render: (value: string, row: any) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <span className="text-primary-600 font-semibold text-sm">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Vai trò',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'admin' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {value === 'admin' ? (
            <>
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </>
          ) : (
            <>
              <UserIcon className="w-3 h-3 mr-1" />
              User
            </>
          )}
        </span>
      ),
    },
    {
      key: 'email_verified_at',
      label: 'Xác thực',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value ? 'Đã xác thực' : 'Chưa xác thực'}
        </span>
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
            to={`/admin/users/edit/${row.id}`}
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý người dùng</h1>
        <p className="text-gray-600">Quản lý tất cả người dùng trong hệ thống</p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={clearError} />
        </div>
      )}

      <Card>
        <div className="flex flex-col space-y-4 mb-6">
          {/* Search and Create */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm người dùng..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <Button type="submit">Tìm kiếm</Button>
            </form>
            <Link to="/admin/users/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Thêm người dùng
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => handleRoleFilterChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleRoleFilterChange('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-1" />
              Admin
            </button>
            <button
              onClick={() => handleRoleFilterChange('user')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'user'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <UserIcon className="w-4 h-4 inline mr-1" />
              User
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có người dùng nào</p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={users} />
            {pagination && pagination.last_page > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.last_page}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {pagination && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng số: <span className="font-semibold">{pagination.total}</span> người dùng
        </div>
      )}
    </div>
  );
};
