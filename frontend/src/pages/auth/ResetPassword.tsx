import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock } from 'lucide-react';
import { authService } from '../../services/authService';
import type { ResetPasswordData } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    defaultValues: {
      token,
      email,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordData) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.resetPassword(data);
      
      // Show success message and redirect to login
      alert('Mật khẩu đã được đặt lại thành công!');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-rose-50 to-pink-100 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đặt lại mật khẩu
          </h1>
          <p className="text-gray-600">Nhập mật khẩu mới của bạn</p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('token')} />
          
          <div>
            <Input
              label="Email"
              type="email"
              {...register('email')}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div>
            <Input
              label="Mật khẩu mới"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Mật khẩu là bắt buộc',
                minLength: {
                  value: 8,
                  message: 'Mật khẩu phải có ít nhất 8 ký tự',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Mật khẩu phải có chữ hoa, chữ thường và số',
                },
              })}
              error={errors.password?.message}
              required
            />
          </div>

          <div>
            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              placeholder="••••••••"
              {...register('password_confirmation', {
                required: 'Xác nhận mật khẩu là bắt buộc',
                validate: (value) =>
                  value === password || 'Mật khẩu xác nhận không khớp',
              })}
              error={errors.password_confirmation?.message}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            Đặt lại mật khẩu
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Quay lại đăng nhập
          </Link>
        </div>
      </Card>
    </div>
  );
};