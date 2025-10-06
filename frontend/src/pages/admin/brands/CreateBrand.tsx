import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalogStore } from '../../../store/catalogStore';
import { BrandForm } from './BrandForm';
import type { Brand } from '../../../types';
import { Alert } from '../../../components/ui/Alert';

export const CreateBrand: React.FC = () => {
  const navigate = useNavigate();
  const { createBrand, isLoading, error, clearError } = useCatalogStore();

  const handleSubmit = async (data: Partial<Brand>) => {
    try {
      await createBrand(data);
      alert('Tạo thương hiệu thành công!');
      navigate('/admin/brands');
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thêm thương hiệu mới</h1>
        <p className="text-gray-600">Tạo thương hiệu sản phẩm mới</p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={clearError} />
        </div>
      )}

      <BrandForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};