import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useContract } from '../../hooks/useContract';
import { useIPFS } from '../../hooks/useIPFS';
import { MedicalRecord, RecordAttachment } from '../../utils/types';
import { formatDateTime, formatFileSize } from '../../utils/helpers';
import { RECORD_TYPES } from '../../utils/constants';
import { 
  DocumentTextIcon,
  CloudArrowDownIcon,
  ExclamationCircleIcon,
  PlusCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function PatientRecords() {
  const { userData } = useAuth();
  const { getPatientRecord } = useContract();
  const { retrieveJSON } = useIPFS();

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [userData?.profile?.stxAddress]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const patientId = userData?.profile?.stxAddress?.testnet;
      if (!patientId) throw new Error('No patient ID found');

      const patientData = await getPatientRecord(patientId);
      
      // Fetch and decrypt records from IPFS
      if (patientData.recordHash) {
        const records = await retrieveJSON(patientData.recordHash);
        setRecords(Array.isArray(records) ? records : []);
      }

    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records
    .filter(record => {
      const matchesSearch = 
        record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.providerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'all' || record.recordType === selectedType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => b.timestamp - a.timestamp);

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
            Medical Records
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your medical records securely
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/records/new"
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <PlusCircleIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Add New Record
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative flex-grow max-w-lg">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  placeholder="Search records..."
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center">
                <FunnelIcon className="mr-2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                >
                  <option value="all">All Types</option>
                  {RECORD_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
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

      {/* Records List */}
      <div className="bg-white shadow sm:rounded-lg divide-y divide-gray-200">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first medical record'}
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div key={record.id} className="px-4 py-6 sm:px-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <h4 className="text-lg font-medium text-primary-600 truncate">
                      {record.recordType}
                    </h4>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {formatDateTime(record.timestamp)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Provider: {record.providerName}
                  </p>
                  <p className="mt-2 text-sm text-gray-900">
                    {record.description}
                  </p>

                  {/* Attachments */}
                  {record.attachments && record.attachments.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700">Attachments</h5>
                      <ul className="mt-2 divide-y divide-gray-200">
                        {record.attachments.map((attachment: RecordAttachment) => (
                          <li key={attachment.ipfsHash} className="py-2 flex items-center justify-between">
                            <div className="flex items-center">
                              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                              <span className="ml-2 text-sm text-gray-900">{attachment.name}</span>
                              <span className="ml-2 text-sm text-gray-500">
                                ({formatFileSize(attachment.size)})
                              </span>
                            </div>
                            <button
                              onClick={() => {/* Implement download logic */}}
                              className="ml-4 text-sm font-medium text-primary-600 hover:text-primary-500"
                            >
                              <CloudArrowDownIcon className="h-5 w-5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex-shrink-0">
                  <Link
                    to={`/records/${record.id}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
