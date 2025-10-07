import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { UserLayout } from './components/layout/UserLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { ProductList as AdminProductList } from './pages/admin/products/ProductList';
import { CreateProduct as AdminProductCreate } from './pages/admin/products/CreateProduct';
import { EditProduct as AdminProductEdit } from './pages/admin/products/EditProduct';
import { CategoryList as AdminCategoryList } from './pages/admin/categories/CategoryList';
import { CreateCategory as AdminCategoryCreate } from './pages/admin/categories/CreateCategory';
import { EditCategory as AdminCategoryEdit } from './pages/admin/categories/EditCategory';
import { BrandList as AdminBrandList } from './pages/admin/brands/BrandList';
import { CreateBrand as AdminBrandCreate } from './pages/admin/brands/CreateBrand';
import { EditBrand as AdminBrandEdit } from './pages/admin/brands/EditBrand';
import { AdminOrderList } from './pages/admin/orders/OrderList';
import { AdminOrderDetail } from './pages/admin/orders/OrderDetail';
import { AdminProfile } from './pages/admin/profile';

// User Pages
import { HomePage } from './pages/user/HomePage';
import { ProductsPage } from './pages/user/products/ProductsPage';
import { ProductDetail } from './pages/user/products/ProductDetail';
import { CartPage } from './pages/user/cart/CartPage';
import { CheckoutPage } from './pages/user/checkout/CheckoutPage';
import { OrdersPage } from './pages/user/orders/OrdersPage';
import { OrderDetail } from './pages/user/orders/OrderDetail';
import { ProfilePage } from './pages/user/profile/ProfilePage';

function App() {
  const { checkAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          
          {/* Product Routes */}
          <Route path="products" element={<AdminProductList />} />
          <Route path="products/create" element={<AdminProductCreate />} />
          <Route path="products/edit/:id" element={<AdminProductEdit />} />
          
          {/* Category Routes */}
          <Route path="categories" element={<AdminCategoryList />} />
          <Route path="categories/create" element={<AdminCategoryCreate />} />
          <Route path="categories/edit/:id" element={<AdminCategoryEdit />} />
          
          {/* Brand Routes */}
          <Route path="brands" element={<AdminBrandList />} />
          <Route path="brands/create" element={<AdminBrandCreate />} />
          <Route path="brands/edit/:id" element={<AdminBrandEdit />} />
          
          {/* Order Routes */}
          <Route path="orders" element={<AdminOrderList />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          
          {/* Profile Routes */}
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Public User Routes - No authentication required */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          
          {/* Product Routes - Public */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slug" element={<ProductDetail />} />
        </Route>

        {/* Protected User Routes - Authentication required */}
        <Route
          path="/user"
          element={
            <ProtectedRoute requiredRole="customer">
              <UserLayout />
            </ProtectedRoute>
          }
        >
          {/* Cart & Checkout Routes */}
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          
          {/* Order Routes */}
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          
          {/* Profile Routes */}
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/user/home" replace />
            )
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
