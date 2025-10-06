import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCatalogStore } from '../../../store/catalogStore';
import { categoryService } from '../../../services/categoryService';
import { CategoryForm } from './CategoryForm';
import type { Category } from '../../../types';
import { Alert } from '../../../components/ui/Alert';

export const EditCategory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateCategory, isLoading, error, clearError } = useCatalogStore();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      try {
        const data = await categoryService.getAdminCategory(id);
        setCategory(data);
      } catch (error) {
        alert('Không tìm thấy danh mục!');
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  const handleSubmit = async (data: Partial<Category>) => {
    if (!id) return;
    try {
      await updateCategory(id, data);
      alert('Cập nhật danh mục thành công!');
      navigate('/admin/categories');
    } catch (error) {
      // Error handled by store
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy danh mục</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Chỉnh sửa danh mục</h1>
        <p className="text-gray-600">Cập nhật thông tin danh mục</p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={clearError} />
        </div>
      )}

      <CategoryForm category={category} onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};
