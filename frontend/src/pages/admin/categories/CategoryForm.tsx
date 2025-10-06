import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import type { Category } from '../../../types';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: Partial<Category> & { image?: File }) => Promise<void>;
  isLoading: boolean;
}

interface FormData extends Partial<Category> {
  image?: FileList;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(category?.image_url || null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: category || { is_active: true },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    const submitData: Partial<Category> & { image?: File } = {
      ...data,
      image: data.image?.[0],
    };
    delete (submitData as any).image; // Remove FileList from data
    if (data.image?.[0]) {
      submitData.image = data.image[0];
    }
    await onSubmit(submitData);
  };

  const clearImage = () => {
    setImagePreview(null);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Thông tin danh mục</h3>
        <div className="space-y-4">
          <Input
            label="Tên danh mục"
            {...register('name', { required: 'Tên danh mục là bắt buộc' })}
            error={errors.name?.message}
            required
          />

          <Input
            label="Slug"
            {...register('slug', { required: 'Slug là bắt buộc' })}
            error={errors.slug?.message}
            helperText="VD: electronics, fashion"
            required
          />

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh
            </label>
            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Chọn ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  {...register('image')}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <span className="text-sm text-gray-500">
                JPG, PNG, GIF, WEBP (tối đa 2MB)
              </span>
            </div>
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('is_active')}
              defaultChecked={category?.is_active ?? true}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Kích hoạt</span>
          </label>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate('/admin/categories')}>
          Hủy
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {category ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
};
