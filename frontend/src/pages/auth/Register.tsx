import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import type { RegisterData } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerUser(data);
      
      // Redirect based on role
      const userRole = useAuthStore.getState().user?.role;
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/home');
      }
    } catch (error) {
      // Error is handled by authStore with toast notification
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-rose-50 to-pink-100 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng Ký</h1>
          <p className="text-gray-600">Tạo tài khoản mới của bạn</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="Họ và tên"
              type="text"
              placeholder="Nguyễn Văn A"
              {...register('full_name', {
                required: 'Họ và tên là bắt buộc',
                minLength: {
                  value: 2,
                  message: 'Họ và tên phải có ít nhất 2 ký tự',
                },
              })}
              error={errors.full_name?.message}
              required
            />
          </div>

          <div>
            <Input
              label="Email"
              type="email"
              placeholder="example@email.com"
              {...register('email', {
                required: 'Email là bắt buộc',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email không hợp lệ',
                },
              })}
              error={errors.email?.message}
              required
            />
          </div>

          <div>
            <Input
              label="Số điện thoại"
              type="tel"
              placeholder="0912345678"
              {...register('phone', {
                pattern: {
                  value: /^[0-9]{10,11}$/,
                  message: 'Số điện thoại không hợp lệ',
                },
              })}
              error={errors.phone?.message}
            />
          </div>

          <div>
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Mật khẩu là bắt buộc',
                minLength: {
                  value: 4,
                  message: 'Mật khẩu phải có ít nhất 4 ký tự',
                },
              })}
              error={errors.password?.message}
              required
            />
          </div>

          <div>
            <Input
              label="Xác nhận mật khẩu"
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

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 mt-1 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              required
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
              Tôi đồng ý với{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                Điều khoản dịch vụ
              </a>{' '}
              và{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                Chính sách bảo mật
              </a>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            Đăng Ký
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};