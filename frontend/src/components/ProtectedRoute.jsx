import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard — two checks:
 * 1. Not authenticated at all → redirect to /login
 * 2. Authenticated but no role selected → redirect to /select-role
 * Only renders children (Outlet) when both checks pass.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, hasSelectedRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasSelectedRole) {
    return <Navigate to="/select-role" replace />;
  }

  return <Outlet />;
}
