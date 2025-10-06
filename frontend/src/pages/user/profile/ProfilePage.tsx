import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Save } from 'lucide-react';
import { profileService } from '../../../services/profileService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

interface ProfileForm {
  full_name: string;
  phone: string;
}

interface PasswordForm {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data.profile);
      setValue('full_name', data.profile.full_name);
      setValue('phone', data.profile.phone || '');
    } catch (error) {
      toast.error('Không thể tải thông tin profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitProfile = async (data: ProfileForm) => {
    try {
      await profileService.updateProfile(data);
      toast.success('Cập nhật thông tin thành công');
      loadProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const onSubmitPassword = async (data: PasswordForm) => {
    try {
      await profileService.changePassword(data);
      toast.success('Đổi mật khẩu thành công');
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary-50 text-primary-600'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Thông tin</span>
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'password'
                    ? 'bg-primary-50 text-primary-600'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Lock className="w-5 h-5" />
                <span className="font-medium">Đổi mật khẩu</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' ? (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-primary-600" />
                <h2 className="text-2xl font-bold">Thông tin cá nhân</h2>
              </div>

              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Email không thể thay đổi
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    {...registerProfile('full_name', {
                      required: 'Họ và tên là bắt buộc',
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {profileErrors.full_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {profileErrors.full_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    {...registerProfile('phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò
                  </label>
                  <input
                    type="text"
                    value={profile?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <Button type="submit" size="lg">
                  <Save className="w-5 h-5 mr-2" />
                  Lưu thay đổi
                </Button>
              </form>
            </Card>
          ) : (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-primary-600" />
                <h2 className="text-2xl font-bold">Đổi mật khẩu</h2>
              </div>

              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu hiện tại *
                  </label>
                  <input
                    type="password"
                    {...registerPassword('current_password', {
                      required: 'Mật khẩu hiện tại là bắt buộc',
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {passwordErrors.current_password && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.current_password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    {...registerPassword('password', {
                      required: 'Mật khẩu mới là bắt buộc',
                      minLength: {
                        value: 8,
                        message: 'Mật khẩu phải có ít nhất 8 ký tự',
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {passwordErrors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    {...registerPassword('password_confirmation', {
                      required: 'Xác nhận mật khẩu là bắt buộc',
                      validate: (value, formValues) =>
                        value === formValues.password || 'Mật khẩu xác nhận không khớp',
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {passwordErrors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.password_confirmation.message}
                    </p>
                  )}
                </div>

                <Button type="submit" size="lg">
                  <Lock className="w-5 h-5 mr-2" />
                  Đổi mật khẩu
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
