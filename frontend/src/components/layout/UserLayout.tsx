import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, User, LogOut, Package, Shield, LogIn } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { ChatButton } from '../chatbot/ChatButton';

export const UserLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Public menu items (visible to all users)
  const publicMenuItems = [
    { icon: Home, label: 'Trang chủ', path: '/user/home' },
    { icon: ShoppingCart, label: 'Sản phẩm', path: '/user/products' },
  ];

  // Protected menu items (visible only to authenticated users)
  const protectedMenuItems = [
    { icon: ShoppingCart, label: 'Giỏ hàng', path: '/user/cart' },
    { icon: Package, label: 'Đơn hàng', path: '/user/orders' },
    { icon: User, label: 'Tài khoản', path: '/user/profile' },
  ];

  const menuItems = isAuthenticated 
    ? [...publicMenuItems, ...protectedMenuItems]
    : publicMenuItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/user/home" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-rose-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-rose-500 bg-clip-text text-transparent">Shop</h1>
                <p className="text-xs text-gray-500">Mua sắm thông minh</p>
              </div>
            </Link>

            <nav className="hidden md:flex space-x-8">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path || 
                  location.pathname.startsWith(item.path + '/') ||
                  (item.path === '/user/home' && (location.pathname === '/user' || location.pathname === '/user/'));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center transition-all relative group ${
                      isActive 
                        ? 'text-primary-600 font-semibold' 
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    {item.label}
                    {isActive && (
                      <span className="absolute -bottom-4 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-rose-500 rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Admin Panel Button - Only show for admin users */}
                  {user?.role === 'admin' && (
                    <Link to="/admin">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-rose-600 text-white border-none hover:from-primary-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <Shield className="w-4 h-4" />
                        <span className="hidden lg:inline">Quản trị</span>
                      </Button>
                    </Link>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="hidden sm:inline">Đăng nhập</span>
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Đăng ký</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <nav className="flex overflow-x-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || 
                location.pathname.startsWith(item.path + '/') ||
                (item.path === '/user/home' && (location.pathname === '/user' || location.pathname === '/user/'));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center px-4 py-2 transition-all min-w-max relative ${
                    isActive 
                      ? 'text-primary-600 bg-primary-50 font-semibold' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                  {isActive && (
                    <span className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-rose-500"></span>
                  )}
                </Link>
              );
            })}
            {/* Login button on mobile when not authenticated */}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="flex flex-col items-center px-4 py-2 transition-all min-w-max text-gray-700 hover:text-primary-600 hover:bg-primary-50"
              >
                <LogIn className="w-5 h-5" />
                <span className="text-xs mt-1">Đăng nhập</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">
        <Outlet />
      </main>

      {/* Chatbot Button - Floating */}
      <ChatButton />

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-rose-500 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Shop</h3>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Nền tảng mua sắm trực tuyến uy tín với hàng nghìn sản phẩm chất lượng. 
                Mua sắm dễ dàng, giao hàng nhanh chóng!
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4 text-white">Liên kết</h4>
              <ul className="space-y-2">
                <li><Link to="/user/products" className="text-gray-400 hover:text-white transition-colors">Sản phẩm</Link></li>
                <li><Link to="/user/orders" className="text-gray-400 hover:text-white transition-colors">Đơn hàng</Link></li>
                <li><Link to="/user/cart" className="text-gray-400 hover:text-white transition-colors">Giỏ hàng</Link></li>
                <li><Link to="/user/profile" className="text-gray-400 hover:text-white transition-colors">Tài khoản</Link></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="font-bold mb-4 text-white">Hỗ trợ</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Liên hệ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Chính sách</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Điều khoản</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 Shop. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <span>·</span>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};