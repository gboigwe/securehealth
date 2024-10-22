import { Buffer } from 'buffer';
import { MedicalRecord, Patient, AccessRequest, TransactionResponse } from './types';
import { ERROR_MESSAGES } from './constants';

// Date and Time Helpers
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateAge = (dateOfBirth: number): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Data Validation Helpers
export const isValidPatientId = (patientId: string): boolean => {
  return patientId.length > 0 && patientId.length <= 64;
};

export const isValidBloodType = (bloodType: string): boolean => {
  return ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(bloodType);
};

export const isValidDateOfBirth = (dateOfBirth: number): boolean => {
  const date = new Date(dateOfBirth);
  const now = new Date();
  return date < now && date.getFullYear() > 1900;
};

// File Handling Helpers
export const calculateFileHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Encryption Helpers
export const encryptData = async (data: any, publicKey: string): Promise<string> => {
  // Implementation would go here
  // This is a placeholder for actual encryption logic
  throw new Error('Encryption not implemented');
};

export const decryptData = async (encryptedData: string, privateKey: string): Promise<any> => {
  // Implementation would go here
  // This is a placeholder for actual decryption logic
  throw new Error('Decryption not implemented');
};

// Transaction Helpers
export const waitForTransaction = async (txId: string, network: any): Promise<TransactionResponse> => {
  let attempts = 0;
  const maxAttempts = 30;
  const delay = 2000; // 2 seconds

  while (attempts < maxAttempts) {
    try {
      const response = await network.getTransactionInfo(txId);
      if (response.tx_status === 'success') {
        return {
          txId,
          status: 'success'
        };
      } else if (response.tx_status === 'failed') {
        return {
          txId,
          status: 'failed',
          errorMessage: response.error_message || 'Transaction failed'
        };
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
    }

    await new Promise(resolve => setTimeout(resolve, delay));
    attempts++;
  }

  return {
    txId,
    status: 'pending',
    errorMessage: 'Transaction timeout'
  };
};

// Error Handling Helpers
export const handleContractError = (error: any): string => {
  const errorCode = error?.message?.match(/\(err u(\d+)\)/)?.[1];
  
  switch (errorCode) {
    case '100':
      return ERROR_MESSAGES.CONTRACT.NOT_AUTHORIZED;
    case '101':
      return ERROR_MESSAGES.CONTRACT.PATIENT_NOT_FOUND;
    case '102':
      return ERROR_MESSAGES.CONTRACT.INVALID_INPUT;
    case '103':
      return ERROR_MESSAGES.CONTRACT.ALREADY_EXISTS;
    case '104':
      return ERROR_MESSAGES.CONTRACT.ACCESS_DENIED;
    case '105':
      return ERROR_MESSAGES.CONTRACT.LIST_FULL;
    default:
      return 'An unexpected error occurred';
  }
};

// UI Helpers
export const truncateAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

export const generateRandomId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Data Transformation Helpers
export const formatPatientForDisplay = (patient: Patient) => {
  return {
    ...patient,
    age: calculateAge(patient.dateOfBirth),
    lastUpdated: formatDateTime(patient.lastUpdated),
    accessListCount: patient.accessList.length
  };
};

export const formatRecordForDisplay = (record: MedicalRecord) => {
  return {
    ...record,
    timestamp: formatDateTime(record.timestamp),
    providerAddress: truncateAddress(record.providerAddress),
    attachmentCount: record.attachments?.length || 0
  };
};

export const formatAccessRequestForDisplay = (request: AccessRequest) => {
  return {
    ...request,
    requestedAt: formatDateTime(request.requestedAt),
    updatedAt: request.updatedAt ? formatDateTime(request.updatedAt) : undefined,
    requesterAddress: truncateAddress(request.requester)
  };
};
