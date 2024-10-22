import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  WalletIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { APP_DETAILS } from '../../utils/constants';

interface ConnectWalletProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

export default function ConnectWallet({ 
  onSuccess, 
  redirectTo = '/dashboard',
  className = ''
}: ConnectWalletProps) {
  const { connectWallet, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      setError(null);
      await connectWallet();
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (redirectTo) {
        navigate(redirectTo);
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Connect Your Wallet
        </h2>
        <p className="mt-4 text-lg leading-6 text-gray-600">
          {APP_DETAILS.name} uses the Stacks wallet to secure your medical records 
          and manage access control.
        </p>
      </div>

      {/* Connection Button */}
      <div className="w-full max-w-md">
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
          ) : (
            <WalletIcon className="-ml-1 mr-2 h-5 w-5" />
          )}
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 rounded-md bg-red-50">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <p className="mt-4 text-sm text-gray-600">
          Don't have a wallet?{' '}
          <a 
            href="https://wallet.hiro.so/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Get Hiro Wallet
          </a>
        </p>
      </div>

      {/* Features Grid */}
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative">
          <dt className="text-base font-semibold leading-7 text-gray-900">
            Secure Authentication
          </dt>
          <dd className="mt-2 text-base leading-7 text-gray-600">
            Your wallet provides secure authentication without passwords.
          </dd>
        </div>
        <div className="relative">
          <dt className="text-base font-semibold leading-7 text-gray-900">
            Data Control
          </dt>
          <dd className="mt-2 text-base leading-7 text-gray-600">
            Maintain full control over your medical records and access permissions.
          </dd>
        </div>
        <div className="relative">
          <dt className="text-base font-semibold leading-7 text-gray-900">
            Privacy First
          </dt>
          <dd className="mt-2 text-base leading-7 text-gray-600">
            Your data is encrypted and only accessible to authorized parties.
          </dd>
        </div>
      </div>
    </div>
  );
}
