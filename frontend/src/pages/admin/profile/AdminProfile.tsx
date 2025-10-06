import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Mail, Shield } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { adminProfileService } from '../../../services/adminProfileService';
import { showToast, getErrorMessage } from '../../../utils/toast';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const AdminProfile: React.FC = () => {
  const { user: authUser, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerInfo,
    handleSubmit: handleSubmitInfo,
    formState: { errors: infoErrors },
    setValue,
  } = useForm<{ full_name: string; phone?: string }>();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    watch,
    reset: resetPasswordForm,
  } = useForm<{
    current_password: string;
    password: string;
    password_confirmation: string;
  }>();

  const newPassword = watch('password');

  useEffect(() => {
    if (authUser?.name) {
      setValue('full_name', authUser.name);
      if (authUser.phone) {
        setValue('phone', authUser.phone);
      }
    }
  }, [authUser, setValue]);

  const onSubmitInfo = async (data: { full_name: string; phone?: string }) => {
    try {
      setIsLoading(true);
      
      const updatedUser = await adminProfileService.updateProfile(data);
      updateUser(updatedUser);
      
      showToast.success('Cập nhật thông tin thành công!');
    } catch (err: any) {
      showToast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => {
    try {
      setIsLoading(true);
      
      await adminProfileService.changePassword(data);
      
      showToast.success('Đổi mật khẩu thành công!');
      resetPasswordForm();
    } catch (err: any) {
      showToast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (!authUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
        <p className="text-gray-600">Quản lý thông tin và bảo mật tài khoản của bạn</p>
      </div>

      {/* User Info Card */}
      <Card className="mb-6">
        <div className="flex items-center p-6 bg-gradient-to-r from-primary-50 to-rose-50 rounded-lg">
          <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center mr-4">
            <span className="text-primary-600 font-bold text-2xl">
              {authUser?.name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{authUser?.name || 'Admin'}</h2>
            <p className="text-gray-600 flex items-center mt-1">
              <Mail className="w-4 h-4 mr-2" />
              {authUser?.email}
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-2">
              <Shield className="w-3 h-3 mr-1" />
              {authUser?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
            </span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="w-5 h-5 inline mr-2" />
            Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Lock className="w-5 h-5 inline mr-2" />
            Đổi mật khẩu
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'info' ? (
          <div className="lg:col-span-2">
            <Card>
              <h3 className="text-lg font-semibold mb-6">Cập nhật thông tin</h3>
              <form onSubmit={handleSubmitInfo(onSubmitInfo)} className="space-y-4 max-w-2xl">
            <Input
              label="Họ và tên"
              {...registerInfo('full_name', {
                required: 'Họ và tên là bắt buộc',
                minLength: {
                  value: 2,
                  message: 'Họ và tên phải có ít nhất 2 ký tự',
                },
              })}
              error={infoErrors.full_name?.message}
              required
            />

            <Input
              label="Email"
              type="email"
              value={authUser?.email}
              disabled
              className="bg-gray-100 cursor-not-allowed"
              helperText="Email không thể thay đổi"
            />

            <Input
              label="Số điện thoại"
              type="tel"
              {...registerInfo('phone')}
              error={infoErrors.phone?.message}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="submit" isLoading={isLoading}>
                Lưu thay đổi
              </Button>
              </div>
              </form>
            </Card>
          </div>
        ) : (
          <div className="lg:col-span-2">
            <Card>
              <h3 className="text-lg font-semibold mb-6">Đổi mật khẩu</h3>
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4 max-w-2xl">
            <Input
              label="Mật khẩu hiện tại"
              type="password"
              {...registerPassword('current_password', {
                required: 'Mật khẩu hiện tại là bắt buộc',
              })}
              error={passwordErrors.current_password?.message}
              required
            />

            <Input
              label="Mật khẩu mới"
              type="password"
              {...registerPassword('password', {
                required: 'Mật khẩu mới là bắt buộc',
                minLength: {
                  value: 8,
                  message: 'Mật khẩu phải có ít nhất 8 ký tự',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Mật khẩu phải có chữ hoa, chữ thường và số',
                },
              })}
              error={passwordErrors.password?.message}
              helperText="Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số"
              required
            />

            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              {...registerPassword('password_confirmation', {
                required: 'Xác nhận mật khẩu là bắt buộc',
                validate: (value) =>
                  value === newPassword || 'Mật khẩu xác nhận không khớp',
              })}
              error={passwordErrors.password_confirmation?.message}
              required
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => resetPasswordForm()}
              >
                Hủy
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Đổi mật khẩu
              </Button>
              </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
