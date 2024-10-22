import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useContract } from '../../hooks/useContract';
import { Patient } from '../../utils/types';
import { formatDateTime, truncateAddress, calculateAge } from '../../utils/helpers';
import { 
  UserIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  ShieldCheckIcon,
  FolderIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface PatientWithAccess extends Patient {
  accessStatus: 'granted' | 'pending' | 'none';
  lastAccessed?: number;
}

export default function PatientList() {
  const { userData } = useAuth();
  const { requestAccess, getPatientRecord } = useContract();

  const [patients, setPatients] = useState<PatientWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'granted' | 'pending' | 'none'>('all');
  const [isRequesting, setIsRequesting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would fetch from the blockchain
      const response = await getPatientRecord('all');
      setPatients(response);

    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patient list');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (patientId: string) => {
    try {
      setIsRequesting(prev => ({ ...prev, [patientId]: true }));
      await requestAccess(patientId);
      
      // Update local state to reflect the pending request
      setPatients(prev =>
        prev.map(patient =>
          patient.id === patientId
            ? { ...patient, accessStatus: 'pending' }
            : patient
        )
      );

    } catch (err) {
      console.error('Error requesting access:', err);
      setError('Failed to request access');
    } finally {
      setIsRequesting(prev => ({ ...prev, [patientId]: false }));
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || patient.accessStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

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
            Patient Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your patient records securely
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <select
                className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Patients</option>
                <option value="granted">Access Granted</option>
                <option value="pending">Access Pending</option>
                <option value="none">No Access</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Patient List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {filteredPatients.map((patient) => (
            <li key={patient.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UserIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {patient.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {truncateAddress(patient.id)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Age: {calculateAge(patient.dateOfBirth)} • Blood Type: {patient.bloodType}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        <p>
                          Last Updated: {formatDateTime(patient.lastUpdated)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 flex space-x-3">
                    {patient.accessStatus === 'granted' && (
                      <Link
                        to={`/provider/patients/${patient.id}`}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        View Records
                      </Link>
                    )}
                    {patient.accessStatus === 'none' && (
                      <button
                        onClick={() => handleRequestAccess(patient.id)}
                        disabled={isRequesting[patient.id]}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        {isRequesting[patient.id] ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Requesting...
                          </>
                        ) : (
                          'Request Access'
                        )}
                      </button>
                    )}
                    {patient.accessStatus === 'pending' && (
                      <span className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100">
                        Access Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
