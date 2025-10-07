import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Save, Camera, Mail, Phone, Shield } from 'lucide-react';
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
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileForm>();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordForm>();

  const newPassword = watch('password');

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-6">
      {/* Header */}
      <div data-aos="fade-down">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Thông tin cá nhân
        </h1>
        <p className="text-gray-600">
          Quản lý thông tin tài khoản của bạn
        </p>
      </div>

      {/* Profile Card */}
      <Card className="bg-gradient-to-br from-primary-50 to-rose-50" data-aos="fade-up">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-rose-400 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors group">
              <Camera className="w-5 h-5 text-gray-600 group-hover:text-primary-600" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile?.full_name}</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-gray-600">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Mail className="w-4 h-4" />
                <span>{profile?.email}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Phone className="w-4 h-4" />
                  <span>{profile?.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Shield className="w-4 h-4" />
                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                  {profile?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1" data-aos="fade-right">
          <Card>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-lg'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Thông tin</span>
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'password'
                    ? 'bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-lg'
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
            <Card data-aos="fade-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Thông tin cá nhân</h2>
                  <p className="text-sm text-gray-600">Cập nhật thông tin của bạn</p>
                </div>
              </div>

              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={profile?.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Email không thể thay đổi
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      {...registerProfile('full_name', {
                        required: 'Họ và tên là bắt buộc',
                      })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  {profileErrors.full_name && (
                    <p className="mt-2 text-sm text-red-600">
                      {profileErrors.full_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      {...registerProfile('phone')}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profile?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                      disabled
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto shadow-lg hover:shadow-xl transition-shadow"
                  disabled={isProfileSubmitting}
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isProfileSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </form>
            </Card>
          ) : (
            <Card data-aos="fade-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <Lock className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Đổi mật khẩu</h2>
                  <p className="text-sm text-gray-600">Cập nhật mật khẩu bảo mật</p>
                </div>
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  {passwordErrors.current_password && (
                    <p className="mt-2 text-sm text-red-600">
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Nhập mật khẩu mới"
                  />
                  {passwordErrors.password && (
                    <p className="mt-2 text-sm text-red-600">
                      {passwordErrors.password.message}
                    </p>
                  )}
                  {newPassword && newPassword.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${
                              i < Math.min(newPassword.length / 2, 4)
                                ? 'bg-primary-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">
                        Độ mạnh:{' '}
                        {newPassword.length < 8
                          ? 'Yếu'
                          : newPassword.length < 12
                          ? 'Trung bình'
                          : 'Mạnh'}
                      </p>
                    </div>
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
                      validate: (value) =>
                        value === newPassword || 'Mật khẩu xác nhận không khớp',
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  {passwordErrors.password_confirmation && (
                    <p className="mt-2 text-sm text-red-600">
                      {passwordErrors.password_confirmation.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto shadow-lg hover:shadow-xl transition-shadow"
                  disabled={isPasswordSubmitting}
                >
                  <Lock className="w-5 h-5 mr-2" />
                  {isPasswordSubmitting ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
