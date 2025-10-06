import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../../../store/productStore';
import { ProductForm } from './ProductForm';
import type { ProductCreateData } from '../../../types';
import { Alert } from '../../../components/ui/Alert';

export const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const { createProduct, isLoading, error, clearError } = useProductStore();

  const handleSubmit = async (data: ProductCreateData) => {
    try {
      await createProduct(data);
      alert('Tạo sản phẩm thành công!');
      navigate('/admin/products');
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thêm sản phẩm mới</h1>
        <p className="text-gray-600">Tạo sản phẩm mới trong hệ thống</p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={clearError} />
        </div>
      )}

      <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};
