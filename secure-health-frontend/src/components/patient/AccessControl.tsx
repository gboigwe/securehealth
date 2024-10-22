import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useContract } from '../../hooks/useContract';
import { 
  ShieldCheckIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { formatDateTime, truncateAddress } from '../../utils/helpers';
import { AccessRequest, HealthcareProvider } from '../../utils/types';

interface AccessControlState {
  pendingRequests: AccessRequest[];
  approvedProviders: HealthcareProvider[];
  revokedProviders: HealthcareProvider[];
}

export default function AccessControl() {
  const { userData } = useAuth();
  const { getAccessRequest, grantAccess, revokeAccess } = useContract();
  
  const [state, setState] = useState<AccessControlState>({
    pendingRequests: [],
    approvedProviders: [],
    revokedProviders: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => {
    fetchAccessData();
  }, [userData?.profile?.stxAddress]);

  const fetchAccessData = async () => {
    try {
      setLoading(true);
      setError(null);

      const patientId = userData?.profile?.stxAddress?.testnet;
      if (!patientId) throw new Error('No patient ID found');

      // Fetch all access requests and provider data
      // In production, this would be fetched from your smart contract
      const accessData = await getAccessRequest(patientId, 'all');
      
      setState({
        pendingRequests: accessData.pending || [],
        approvedProviders: accessData.approved || [],
        revokedProviders: accessData.revoked || []
      });

    } catch (err) {
      console.error('Error fetching access data:', err);
      setError('Failed to load access control data');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async (providerId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const patientId = userData?.profile?.stxAddress?.testnet;
      if (!patientId) throw new Error('No patient ID found');

      await grantAccess(patientId, providerId);
      
      // Update local state
      const updatedRequest = state.pendingRequests.find(req => req.requester === providerId);
      if (updatedRequest) {
        setState(prev => ({
          pendingRequests: prev.pendingRequests.filter(req => req.requester !== providerId),
          approvedProviders: [...prev.approvedProviders, {
            id: providerId,
            name: updatedRequest.providerName,
            licenseNumber: updatedRequest.licenseNumber || '',
            isActive: true
          }],
          revokedProviders: prev.revokedProviders
        }));
      }

      setSuccessMessage('Access granted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err) {
      console.error('Error granting access:', err);
      setError('Failed to grant access');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (providerId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const patientId = userData?.profile?.stxAddress?.testnet;
      if (!patientId) throw new Error('No patient ID found');

      await revokeAccess(patientId, providerId);
      
      // Update local state
      const revokedProvider = state.approvedProviders.find(provider => provider.id === providerId);
      if (revokedProvider) {
        setState(prev => ({
          pendingRequests: prev.pendingRequests,
          approvedProviders: prev.approvedProviders.filter(provider => provider.id !== providerId),
          revokedProviders: [...prev.revokedProviders, { ...revokedProvider, isActive: false }]
        }));
      }

      setSuccessMessage('Access revoked successfully');
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err) {
      console.error('Error revoking access:', err);
      setError('Failed to revoke access');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Access Control
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage healthcare provider access to your medical records
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Pending Access Requests
          </h3>
          <div className="mt-4">
            {state.pendingRequests.length === 0 ? (
              <p className="text-sm text-gray-500">No pending access requests</p>
            ) : (
              <ul role="list" className="divide-y divide-gray-200">
                {state.pendingRequests.map((request) => (
                  <li key={request.requester} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {request.providerName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {truncateAddress(request.requester)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Requested: {formatDateTime(request.requestedAt)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleGrantAccess(request.requester)}
                          disabled={loading}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRevokeAccess(request.requester)}
                          disabled={loading}
                          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Deny
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Active Providers */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Approved Healthcare Providers
          </h3>
          <div className="mt-4">
            {state.approvedProviders.length === 0 ? (
              <p className="text-sm text-gray-500">No approved healthcare providers</p>
            ) : (
              <ul role="list" className="divide-y divide-gray-200">
                {state.approvedProviders.map((provider) => (
                  <li key={provider.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {provider.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          License: {provider.licenseNumber}
                        </p>
                        <p className="text-xs text-gray-400">
                          {truncateAddress(provider.id)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRevokeAccess(provider.id)}
                        disabled={loading}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Revoke Access
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Access History */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Revoked Access History
          </h3>
          <div className="mt-4">
            {state.revokedProviders.length === 0 ? (
              <p className="text-sm text-gray-500">No revoked access history</p>
            ) : (
              <ul role="list" className="divide-y divide-gray-200">
                {state.revokedProviders.map((provider) => (
                  <li key={provider.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {provider.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {truncateAddress(provider.id)}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Revoked
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
