import { ACCESS_STATUS, RECORD_TYPES, BLOOD_TYPES } from './constants';

// User Types
export interface UserData {
  profile: {
    stxAddress: {
      mainnet: string;
      testnet: string;
    };
    name?: string;
    email?: string;
  };
  appPrivateKey: string;
}

// Patient Types
export interface Patient {
  id: string;
  name: string;
  dateOfBirth: number;
  bloodType: typeof BLOOD_TYPES[number];
  recordHash: string;
  lastUpdated: number;
  isActive: boolean;
  owner: string;
  accessList: string[];
}

// Record Types
export interface MedicalRecord {
  id: string;
  patientId: string;
  recordType: typeof RECORD_TYPES[number];
  timestamp: number;
  providerAddress: string;
  providerName: string;
  description: string;
  ipfsHash: string;
  attachments?: RecordAttachment[];
  signature?: string;
}

export interface RecordAttachment {
  name: string;
  type: string;
  ipfsHash: string;
  size: number;
  uploadedAt: number;
}

// Provider Types
export interface HealthcareProvider {
  address: string;
  name: string;
  licenseNumber: string;
  isActive: boolean;
  specialization?: string;
  patients?: string[];
}

// Access Types
export interface AccessRequest {
  patientId: string;
  requester: string;
  status: typeof ACCESS_STATUS[keyof typeof ACCESS_STATUS];
  requestedAt: number;
  updatedAt?: number;
}

// Transaction Types
export interface TransactionResponse {
  txId: string;
  status: 'pending' | 'success' | 'failed';
  errorMessage?: string;
}

// Form Types
export interface PatientRegistrationForm {
  name: string;
  dateOfBirth: string;
  bloodType: typeof BLOOD_TYPES[number];
}

export interface RecordUpdateForm {
  recordType: typeof RECORD_TYPES[number];
  description: string;
  attachments?: File[];
}

export interface ProviderRegistrationForm {
  name: string;
  licenseNumber: string;
  specialization?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
