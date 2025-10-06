import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProductStore } from '../../../store/productStore';
import { ProductForm } from './ProductForm';
import type { ProductCreateData } from '../../../types';
import { Alert } from '../../../components/ui/Alert';

export const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProduct, fetchProductById, updateProduct, isLoading, error, clearError } = useProductStore();

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id]);

  const handleSubmit = async (data: ProductCreateData) => {
    if (!id) return;
    try {
      await updateProduct(id, data);
      alert('Cập nhật sản phẩm thành công!');
      navigate('/admin/products');
    } catch (error) {
      // Error handled by store
    }
  };

  if (isLoading && !currentProduct) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Chỉnh sửa sản phẩm</h1>
        <p className="text-gray-600">Cập nhật thông tin sản phẩm</p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={clearError} />
        </div>
      )}

      <ProductForm product={currentProduct} onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};
