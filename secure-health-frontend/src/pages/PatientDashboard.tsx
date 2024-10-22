import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContract } from '../hooks/useContract';
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  LockClosedIcon, 
  CalendarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  provider: string;
  description: string;
  hash: string;
}

interface AccessRequest {
  provider: string;
  providerName: string;
  status: string;
  requestedAt: string;
}

interface HealthcareProvider {
  id: string;
  name: string;
  hasAccess: boolean;
  lastAccessed?: string;
}

export default function PatientDashboard() {
  const { userData } = useAuth();
  const { getPatientRecord, grantAccess, revokeAccess } = useContract();
  
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [providers, setProviders] = useState<HealthcareProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real implementation, these would be actual contract calls
        const patientData = await getPatientRecord(userData?.profile?.stxAddress);
        
        // Simulated data for development
        setRecords([
          {
            id: '1',
            date: '2024-03-15',
            type: 'General Checkup',
            provider: 'Dr. Smith',
            description: 'Annual physical examination',
            hash: '0x123...'
          },
          {
            id: '2',
            date: '2024-03-01',
            type: 'Laboratory Results',
            provider: 'City Hospital Lab',
            description: 'Blood work analysis',
            hash: '0x456...'
          }
        ]);
        
        setAccessRequests([
          {
            provider: '0x789...',
            providerName: 'Dr. Johnson',
            status: 'pending',
            requestedAt: '2024-03-14'
          },
          {
            provider: '0xabc...',
            providerName: 'Dr. Williams',
            status: 'pending',
            requestedAt: '2024-03-13'
          }
        ]);

        setProviders([
          {
            id: '1',
            name: 'Dr. Smith',
            hasAccess: true,
            lastAccessed: '2024-03-15'
          },
          {
            id: '2',
            name: 'City Hospital',
            hasAccess: true,
            lastAccessed: '2024-03-10'
          }
        ]);

      } catch (error) {
        console.error('Error fetching patient data:', error);
        setError('Failed to load patient data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userData?.profile?.stxAddress) {
      fetchPatientData();
    }
  }, [userData?.profile?.stxAddress]);

  const handleGrantAccess = async (providerId: string) => {
    try {
      setError(null);
      await grantAccess(userData?.profile?.stxAddress, providerId);
      // Update the UI accordingly
      setAccessRequests(prev => 
        prev.map(req => 
          req.provider === providerId 
            ? { ...req, status: 'approved' } 
            : req
        )
      );
    } catch (error) {
      console.error('Error granting access:', error);
      setError('Failed to grant access. Please try again.');
    }
  };

  const handleRevokeAccess = async (providerId: string) => {
    try {
      setError(null);
      await revokeAccess(userData?.profile?.stxAddress, providerId);
      // Update the UI accordingly
      setProviders(prev =>
        prev.map(provider =>
          provider.id === providerId
            ? { ...provider, hasAccess: false }
            : provider
        )
      );
    } catch (error) {
      console.error('Error revoking access:', error);
      setError('Failed to revoke access. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Records</dt>
                  <dd className="text-lg font-medium text-gray-900">{records.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Providers</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {providers.filter(p => p.hasAccess).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <LockClosedIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Requests</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {accessRequests.filter(r => r.status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Records */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Medical Records</h3>
          <div className="mt-4">
            <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {records.map((record) => (
                  <li key={record.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{record.type}</p>
                        <p className="truncate text-sm text-gray-500">
                          {record.provider} - {record.date}
                        </p>
                        <p className="text-sm text-gray-500">{record.description}</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Access Requests */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Access Requests</h3>
          <div className="mt-4">
            <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {accessRequests.map((request) => (
                  <li key={request.provider} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{request.providerName}</p>
                        <p className="text-sm text-gray-500">
                          Requested: {new Date(request.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleGrantAccess(request.provider)}
                              className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRevokeAccess(request.provider)}
                              className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                            >
                              Deny
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
