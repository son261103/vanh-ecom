import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { useCatalogStore } from '../../../store/catalogStore';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import type { Product, ProductCreateData } from '../../../types';
import { getImageUrl } from '../../../utils/imageUtils';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductCreateData) => Promise<void>;
  isLoading: boolean;
}

interface FormData extends ProductCreateData {
  images?: FileList;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const { categories, brands, fetchCategories, fetchBrands } = useCatalogStore();
  
  // Initialize image previews from existing product
  const getInitialPreviews = () => {
    if (product?.images && product.images.length > 0) {
      return product.images.map(img => img.url || img.image_url).filter(Boolean);
    }
    // If no images array, try primary_image_url
    if (product?.primary_image_url) {
      return [product.primary_image_url];
    }
    return [];
  };
  
  const [imagePreviews, setImagePreviews] = useState<string[]>(getInitialPreviews());
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    defaultValues: product || { is_active: true },
  });

  const categoryId = watch('category_id');
  const brandId = watch('brand_id');

  // Update form when product changes
  useEffect(() => {
    if (product) {
      reset(product);
      // Update image previews with full URLs
      const previews = [];
      
      if (product.images && product.images.length > 0) {
        // Has full images array (detail view)
        previews.push(...product.images.map(img => getImageUrl(img.url || img.image_url)));
      } else if (product.primary_image_url) {
        // Only has primary image (list view)
        previews.push(getImageUrl(product.primary_image_url));
      }
      
      if (previews.length > 0) {
        setImagePreviews(previews);
      }
    }
  }, [product, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: FormData) => {
    const submitData: any = {
      ...data,
      images: selectedFiles,
    };
    await onSubmit(submitData);
  };

  useEffect(() => {
    fetchCategories(true);
    fetchBrands(true);
  }, []);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Tên sản phẩm"
              {...register('name', { required: 'Tên sản phẩm là bắt buộc' })}
              error={errors.name?.message}
              required
            />
          </div>

          <Input
            label="SKU"
            {...register('sku', { required: 'SKU là bắt buộc' })}
            error={errors.sku?.message}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('category_id', { required: 'Danh mục là bắt buộc' })}
              value={categoryId || ''}
              onChange={(e) => {
                register('category_id').onChange(e);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-sm text-rose-600">{errors.category_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thương hiệu <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('brand_id', { required: 'Thương hiệu là bắt buộc' })}
              value={brandId || ''}
              onChange={(e) => {
                register('brand_id').onChange(e);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Chọn thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            {errors.brand_id && (
              <p className="mt-1 text-sm text-rose-600">{errors.brand_id.message}</p>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Giá và tồn kho</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Giá gốc"
            type="number"
            step="0.01"
            {...register('price', {
              required: 'Giá gốc là bắt buộc',
              min: { value: 0, message: 'Giá phải lớn hơn 0' },
            })}
            error={errors.price?.message}
            required
          />

          <Input
            label="Giá khuyến mãi"
            type="number"
            step="0.01"
            {...register('sale_price', {
              min: { value: 0, message: 'Giá phải lớn hơn 0' },
            })}
            error={errors.sale_price?.message}
          />

          <Input
            label="Tồn kho"
            type="number"
            {...register('stock_quantity', {
              required: 'Tồn kho là bắt buộc',
              min: { value: 0, message: 'Tồn kho không được âm' },
            })}
            error={errors.stock_quantity?.message}
            required
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Mô tả</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả sản phẩm <span className="text-rose-500">*</span>
          </label>
          <textarea
            {...register('description', { required: 'Mô tả là bắt buộc' })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-rose-600">{errors.description.message}</p>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Hình ảnh sản phẩm</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ảnh sản phẩm <span className="text-red-500">*</span>
          </label>
          
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="h-32 w-full object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Ảnh chính
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Chọn ảnh</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <span className="text-sm text-gray-500">
              Chọn nhiều ảnh. Ảnh đầu tiên sẽ là ảnh chính
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            JPG, PNG, GIF, WEBP (tối đa 2MB/ảnh). Có thể chọn nhiều ảnh cùng lúc.
          </p>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Cài đặt</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('is_featured')}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Sản phẩm nổi bật</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('is_active')}
              defaultChecked={product?.is_active ?? true}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Kích hoạt</span>
          </label>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
          Hủy
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {product ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
};
