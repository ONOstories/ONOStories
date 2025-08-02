import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';

interface ProtectedRouteProps {
  allowedRoles: Array<'normaluser' | 'prouser'>;
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  // While loading auth state, don't render anything
  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but their role is not allowed, redirect
  if (!profile || !allowedRoles.includes(profile.role)) {
    // Redirect normal users trying to access pro features to pricing
    if (profile?.role === 'normaluser') {
        return <Navigate to="/pricing" replace />;
    }
    // For other cases, redirect to home
    return <Navigate to="/" replace />;
  }

  // If user is authenticated and has the correct role, render the child component
  return <Outlet />;
};

export default ProtectedRoute;
