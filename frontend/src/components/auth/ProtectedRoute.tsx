import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'customer';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const location = useLocation();
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      await checkAuth();
      setIsChecking(false);
    };
    check();
  }, [checkAuth]);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Admin can access both admin and customer routes
    // Only redirect if customer tries to access admin routes
    if (requiredRole === 'admin' && user?.role !== 'admin') {
      return <Navigate to="/user/home" replace />;
    }
    // If customer tries to access admin, redirect to user dashboard
    // Admin accessing customer routes is allowed (no redirect)
    if (requiredRole === 'customer' && user?.role === 'admin') {
      // Allow admin to view customer interface
      return <>{children}</>;
    }
  }

  return <>{children}</>;
};
