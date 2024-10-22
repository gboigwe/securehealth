import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useContract } from '../../hooks/useContract';
import { useIPFS } from '../../hooks/useIPFS';
import { MedicalRecord, Patient, RecordAttachment } from '../../utils/types';
import { formatDateTime, formatFileSize, calculateAge } from '../../utils/helpers';
import { 
  DocumentIcon,
  ArrowLeftIcon,
  CloudArrowDownIcon,
  ExclamationCircleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  HeartIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function RecordView() {
  const { id: patientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { getPatientRecord } = useContract();
  const { retrieveFile, retrieveJSON } = useIPFS();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verify access and fetch patient data
      const patientData = await getPatientRecord(patientId!);
      if (!patientData) {
        throw new Error('Patient not found or access denied');
      }

      // Transform PatientRecord to Patient
      const patient: Patient = {
        id: patientId!,
        accessList: [], // Populate this based on your logic
        ...patientData
      };

      setPatient(patientData);

      // Fetch and decrypt records from IPFS
      if (patientData.recordHash) {
        const recordsData = await retrieveJSON(patientData.recordHash);
        setRecords(Array.isArray(recordsData) ? recordsData.sort((a, b) => b.timestamp - a.timestamp) : []);
      }

    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAttachment = async (record: MedicalRecord, attachment: RecordAttachment) => {
    try {
      setDownloadingFile(attachment.ipfsHash);
      setError(null);

      const fileData = await retrieveFile(attachment.ipfsHash);
      
      // Create blob and trigger download
      const blob = new Blob([fileData]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error('Error downloading attachment:', err);
      setError('Failed to download attachment');
    } finally {
      setDownloadingFile(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Patient not found or access denied</h3>
        <button
          onClick={() => navigate('/provider/patients')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100"
        >
          Return to Patient List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <nav className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Patients
        </button>
      </nav>

      {/* Patient Information Card */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-gray-400" />
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
                <p className="text-sm text-gray-500">ID: {patientId}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Age: {calculateAge(patient.dateOfBirth)}</p>
              <p className="text-sm text-gray-500">Blood Type: {patient.bloodType}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Records List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Medical Records</h3>
        </div>
        <div className="border-t border-gray-200">
          {records.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
              <p className="mt-1 text-sm text-gray-500">This patient has no medical records yet.</p>
            </div>
          ) : (
            <ul role="list" className="divide-y divide-gray-200">
              {records.map((record) => (
                <li
                  key={record.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedRecord(selectedRecord?.id === record.id ? null : record)}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <DocumentIcon className="h-5 w-5 text-gray-400" />
                          <p className="ml-2 text-sm font-medium text-primary-600">{record.recordType}</p>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">{record.description}</p>
                        </div>
                      </div>
                      <div className="ml-6 flex items-center space-x-4">
                        <div className="text-right text-sm text-gray-500">
                          <ClockIcon className="inline h-4 w-4 mr-1" />
                          {formatDateTime(record.timestamp)}
                        </div>
                        <ChevronRightIcon
                          className={`h-5 w-5 text-gray-400 transform transition-transform ${
                            selectedRecord?.id === record.id ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Expanded Record Details */}
                    {selectedRecord?.id === record.id && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Provider Details</h4>
                            <p className="mt-1 text-sm text-gray-900">{record.providerName}</p>
                            <p className="text-xs text-gray-500">{record.providerAddress}</p>
                          </div>
                          {record.attachments && record.attachments.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Attachments</h4>
                              <ul className="mt-1 space-y-2">
                                {record.attachments.map((attachment) => (
                                  <li key={attachment.ipfsHash} className="flex items-center justify-between text-sm">
                                    <span className="flex items-center">
                                      <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                                      {attachment.name}
                                      <span className="ml-2 text-xs text-gray-500">
                                        ({formatFileSize(attachment.size)})
                                      </span>
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadAttachment(record, attachment);
                                      }}
                                      disabled={downloadingFile === attachment.ipfsHash}
                                      className="text-primary-600 hover:text-primary-700"
                                    >
                                      {downloadingFile === attachment.ipfsHash ? (
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                      ) : (
                                        <CloudArrowDownIcon className="h-5 w-5" />
                                      )}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
