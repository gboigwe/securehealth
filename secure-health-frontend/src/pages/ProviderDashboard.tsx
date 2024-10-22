import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContract } from '../hooks/useContract';
import { 
  UserIcon, 
  DocumentPlusIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Patient {
  id: string;
  name: string;
  accessStatus: 'granted' | 'pending' | 'none';
  lastUpdated: string;
  recordCount: number;
}

interface Record {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  date: string;
  description: string;
  hash: string;
}

export default function ProviderDashboard() {
  const { userData } = useAuth();
  const { requestAccess, getPatientRecord, updatePatientRecord } = useContract();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [recentRecords, setRecentRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulated data - in production, these would be actual contract calls
        setPatients([
          {
            id: '1',
            name: 'John Doe',
            accessStatus: 'granted',
            lastUpdated: '2024-03-15',
            recordCount: 5
          },
          {
            id: '2',
            name: 'Jane Smith',
            accessStatus: 'pending',
            lastUpdated: '2024-03-14',
            recordCount: 3
          },
          {
            id: '3',
            name: 'Alice Johnson',
            accessStatus: 'granted',
            lastUpdated: '2024-03-13',
            recordCount: 7
          }
        ]);

        setRecentRecords([
          {
            id: '1',
            patientId: '1',
            patientName: 'John Doe',
            type: 'Checkup',
            date: '2024-03-15',
            description: 'Regular checkup - Blood pressure normal',
            hash: '0x123...'
          },
          {
            id: '2',
            patientId: '3',
            patientName: 'Alice Johnson',
            type: 'Prescription',
            date: '2024-03-13',
            description: 'Prescribed antibiotics for infection',
            hash: '0x456...'
          }
        ]);

      } catch (error) {
        console.error('Error fetching provider data:', error);
        setError('Failed to load provider data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userData?.profile?.stxAddress) {
      fetchProviderData();
    }
  }, [userData?.profile?.stxAddress]);

  const handleRequestAccess = async (patientId: string) => {
    try {
      setError(null);
      await requestAccess(patientId);
      // Update UI optimistically
      setPatients(prev =>
        prev.map(patient =>
          patient.id === patientId
            ? { ...patient, accessStatus: 'pending' }
            : patient
        )
      );
    } catch (error) {
      console.error('Error requesting access:', error);
      setError('Failed to request access. Please try again.');
    }
  };

  const handleAddRecord = async (patientId: string, recordData: any) => {
    try {
      setError(null);
      // Implement record addition logic
      setShowAddRecordModal(false);
      // Refresh records
    } catch (error) {
      console.error('Error adding record:', error);
      setError('Failed to add record. Please try again.');
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Provider Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                  <dd className="text-lg font-medium text-gray-900">{patients.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Access</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {patients.filter(p => p.accessStatus === 'granted').length}
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
                <ClockIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Requests</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {patients.filter(p => p.accessStatus === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Patient List */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Patients</h3>
            <div className="flex space-x-4">
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
            </div>
          </div>
          <div className="mt-4">
            <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <li key={patient.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-500">
                          Last updated: {patient.lastUpdated} • Records: {patient.recordCount}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {patient.accessStatus === 'granted' && (
                          <button
                            onClick={() => setSelectedPatient(patient)}
                            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                          >
                            View Records
                          </button>
                        )}
                        {patient.accessStatus === 'none' && (
                          <button
                            onClick={() => handleRequestAccess(patient.id)}
                            className="inline-flex items-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
                          >
                            Request Access
                          </button>
                        )}
                        {patient.accessStatus === 'pending' && (
                          <span className="inline-flex items-center rounded-md bg-yellow-100 px-3 py-2 text-sm font-medium text-yellow-800">
                            Access Pending
                          </span>
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

      {/* Recent Records */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Records</h3>
          <div className="mt-4">
            <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {recentRecords.map((record) => (
                  <li key={record.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {record.patientName} - {record.type}
                        </p>
                        <p className="text-sm text-gray-500">
                          {record.date} • {record.description}
                        </p>
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

      {/* Add Record Modal would go here */}
    </div>
  );
}
