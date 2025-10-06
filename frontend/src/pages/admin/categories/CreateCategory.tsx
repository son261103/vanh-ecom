import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalogStore } from '../../../store/catalogStore';
import { CategoryForm } from './CategoryForm';
import type { Category } from '../../../types';
import { Alert } from '../../../components/ui/Alert';

export const CreateCategory: React.FC = () => {
  const navigate = useNavigate();
  const { createCategory, isLoading, error, clearError } = useCatalogStore();

  const handleSubmit = async (data: Partial<Category>) => {
    try {
      await createCategory(data);
      alert('Tạo danh mục thành công!');
      navigate('/admin/categories');
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thêm danh mục mới</h1>
        <p className="text-gray-600">Tạo danh mục sản phẩm mới</p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={clearError} />
        </div>
      )}

      <CategoryForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};
