import { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface RoleGuardProps {
  children: ReactNode;
  roles: ('patient' | 'provider' | 'admin')[];
  fallback?: ReactNode;
}

export default function RoleGuard({ 
  children, 
  roles, 
  fallback = null 
}: RoleGuardProps) {
  const { userData } = useAuth();
  const userRole = userData?.profile?.role || 'patient';

  if (!roles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
