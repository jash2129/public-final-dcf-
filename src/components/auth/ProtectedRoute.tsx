import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: 'admin' | 'user' | 'super_admin';
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (role && user) {
    if (role === 'admin' && user.role !== 'admin' && user.role !== 'super_admin') {
      return <Navigate to="/" replace />;
    }
    if (role === 'super_admin' && user.role !== 'super_admin') {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
