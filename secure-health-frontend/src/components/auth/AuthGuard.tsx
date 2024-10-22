import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ConnectWallet from './ConnectWallet';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: 'patient' | 'provider' | 'admin';
  fallbackPath?: string;
}

export default function AuthGuard({ 
  children, 
  requiredRole,
  fallbackPath = '/'
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, userData } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!isLoading && !isAuthenticated) {
        // Store the attempted URL for post-login redirect
        sessionStorage.setItem('redirectTo', location.pathname);
        navigate(fallbackPath);
        return;
      }

      if (isAuthenticated && requiredRole) {
        // Check if user has the required role
        // This is a simplified example - implement your actual role checking logic
        const userRole = userData?.profile?.role || 'patient';
        if (userRole !== requiredRole) {
          navigate('/unauthorized');
          return;
        }
      }

      setIsAuthorized(true);
    };

    checkAuthorization();
  }, [isAuthenticated, isLoading, requiredRole, userData, navigate, location.pathname, fallbackPath]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Show wallet connection if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <ConnectWallet />
      </div>
    );
  }

  // Show unauthorized message if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Unauthorized Access</h2>
          <p className="mt-2 text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}
