import { useAuth } from '../../hooks/useAuth';
import { truncateAddress } from '../../utils/helpers';

interface AuthStatusProps {
  showAddress?: boolean;
  showRole?: boolean;
  className?: string;
}

export default function AuthStatus({ 
  showAddress = true, 
  showRole = true,
  className = '' 
}: AuthStatusProps) {
  const { isAuthenticated, userData, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse h-3 w-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Not connected
      </div>
    );
  }

  const address = userData?.profile?.stxAddress?.testnet;
  const role = userData?.profile?.role || 'patient';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showAddress && address && (
        <span className="text-sm font-medium text-gray-900">
          {truncateAddress(address)}
        </span>
      )}
      {showRole && (
        <span className={`
          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${role === 'provider' ? 'bg-blue-100 text-blue-800' : ''}
          ${role === 'admin' ? 'bg-purple-100 text-purple-800' : ''}
          ${role === 'patient' ? 'bg-green-100 text-green-800' : ''}
        `}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
      )}
    </div>
  );
}
