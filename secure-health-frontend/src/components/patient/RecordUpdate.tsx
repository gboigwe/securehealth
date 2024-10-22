import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../hooks/useAuth';
import { useContract } from '../../hooks/useContract';
import { useIPFS } from '../../hooks/useIPFS';
import { RECORD_TYPES } from '../../utils/constants';
import { RecordUpdateForm } from '../../utils/types';
import { calculateFileHash, formatFileSize } from '../../utils/helpers';
import { 
  ExclamationCircleIcon,
  XCircleIcon,
  CloudArrowUpIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

export default function RecordUpdate() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { updatePatientRecord } = useContract();
  const { uploadFile, uploadJSON } = useIPFS();

  const [form, setForm] = useState<RecordUpdateForm>({
    recordType: RECORD_TYPES[0],
    description: '',
    attachments: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setForm(prev => ({
      ...prev,
      attachments: [
        ...(prev.attachments || []),
        ...acceptedFiles
      ].slice(0, 5) // Limit to 5 attachments
    }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxSize: 10485760, // 10MB
    maxFiles: 5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!form.description.trim()) {
        throw new Error('Please provide a description');
      }

      const patientId = userData?.profile?.stxAddress?.testnet;
      if (!patientId) throw new Error('No patient ID found');

      // Upload attachments to IPFS
      const attachmentPromises = form.attachments?.map(async (file) => {
        const ipfsHash = await uploadFile(file);
        const hash = await calculateFileHash(file);
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          ipfsHash,
          hash,
          uploadedAt: Date.now()
        };
      }) || [];

      const uploadedAttachments = await Promise.all(attachmentPromises);

      // Create record data
      const recordData = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
        recordType: form.recordType,
        description: form.description,
        timestamp: Date.now(),
        attachments: uploadedAttachments,
        providerAddress: userData?.profile?.stxAddress?.testnet,
        providerName: userData?.profile?.name || 'Unknown Provider'
      };

      // Upload record data to IPFS
      const recordHash = await uploadJSON(recordData);

      // Update blockchain record
      await updatePatientRecord(patientId, recordHash);

      navigate('/records');
    } catch (err) {
      console.error('Error updating record:', err);
      setError(err instanceof Error ? err.message : 'Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Add Medical Record
          </h3>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
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

          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            {/* Record Type Selection */}
            <div>
              <label htmlFor="recordType" className="block text-sm font-medium text-gray-700">
                Record Type *
              </label>
              <select
                id="recordType"
                name="recordType"
                value={form.recordType}
                onChange={(e) => setForm(prev => ({ ...prev, recordType: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              >
                {RECORD_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter record details..."
                required
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Attachments (Optional)
              </label>
              <div className="mt-1">
                <div
                  {...getRootProps()}
                  className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 ${
                    isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label className="relative cursor-pointer rounded-md bg-white font-semibold text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 hover:text-primary-500">
                        <span>Upload files</span>
                        <input {...getInputProps()} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">
                      Up to 5 files, max 10MB each (PDF, Images, Text)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* File List */}
            {form.attachments && form.attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
                <ul className="mt-2 divide-y divide-gray-200">
                  {form.attachments.map((file, index) => (
                    <li key={index} className="py-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <DocumentIcon className="h-5 w-5 text-gray-400" />
                        <span className="ml-2 text-sm text-gray-900">{file.name}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newAttachments = [...(form.attachments || [])];
                          newAttachments.splice(index, 1);
                          setForm(prev => ({ ...prev, attachments: newAttachments }));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
