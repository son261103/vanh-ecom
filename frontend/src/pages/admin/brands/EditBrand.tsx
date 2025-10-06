import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCatalogStore } from '../../../store/catalogStore';
import { brandService } from '../../../services/brandService';
import { BrandForm } from './BrandForm';
import type { Brand } from '../../../types';
import { Alert } from '../../../components/ui/Alert';

export const EditBrand: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateBrand, isLoading, error, clearError } = useCatalogStore();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
      if (!id) return;
      try {
        const data = await brandService.getAdminBrand(id);
        setBrand(data);
      } catch (error) {
        alert('Không tìm thấy thương hiệu!');
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();
  }, [id]);

  const handleSubmit = async (data: Partial<Brand>) => {
    if (!id) return;
    try {
      await updateBrand(id, data);
      alert('Cập nhật thương hiệu thành công!');
      navigate('/admin/brands');
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

  if (!brand) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy thương hiệu</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Chỉnh sửa thương hiệu</h1>
        <p className="text-gray-600">Cập nhật thông tin thương hiệu</p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={clearError} />
        </div>
      )}

      <BrandForm brand={brand} onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};