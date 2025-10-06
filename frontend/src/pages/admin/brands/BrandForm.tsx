import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useCatalogStore } from '../../../store/catalogStore';
import type { Brand } from '../../../types';

interface BrandFormProps {
  brand?: Brand;
  onSubmit: (data: Partial<Brand>) => Promise<void>;
  isLoading: boolean;
}

export const BrandForm: React.FC<BrandFormProps> = ({ brand, onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const { categories, fetchCategories, isLoading: loadingCategories } = useCatalogStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<Brand>>({
    defaultValues: brand || {},
  });

  useEffect(() => {
    // Fetch categories for dropdown (only active categories)
    fetchCategories(true);
  }, [fetchCategories]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Thông tin thương hiệu</h3>
        <div className="space-y-4">
          <Input
            label="Tên thương hiệu"
            {...register('name', { required: 'Tên thương hiệu là bắt buộc' })}
            error={errors.name?.message}
            required
          />

          <Input
            label="Slug"
            {...register('slug', { required: 'Slug là bắt buộc' })}
            error={errors.slug?.message}
            helperText="VD: samsung, apple, nike"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category_id', { required: 'Vui lòng chọn danh mục' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loadingCategories}
            >
              {categories
                .filter(cat => cat.is_active)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Thương hiệu thuộc danh mục nào? VD: Apple, Samsung thuộc Danh mục Điện thoại
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('is_active')}
              defaultChecked={brand?.is_active ?? true}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Kích hoạt</span>
          </label>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate('/admin/brands')}>
          Hủy
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {brand ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
};