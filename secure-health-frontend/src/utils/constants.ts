import { StacksTestnet, StacksMainnet } from '@stacks/network';

export const APP_DETAILS = {
  name: 'SecureHealth',
  icon: '/health-logo.svg',
  description: 'Decentralized Healthcare Records Management'
};

export const NETWORK = {
  testnet: new StacksTestnet(),
  mainnet: new StacksMainnet()
};

export const CONTRACT = {
  address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  name: 'PatientRecord',
  // Function names from the smart contract
  functions: {
    getPatientRecord: 'get-patient-record',
    registerPatient: 'register-patient',
    updateRecord: 'update-patient-record',
    requestAccess: 'request-access',
    grantAccess: 'grant-access',
    revokeAccess: 'revoke-access',
    getAccessRequest: 'get-access-request',
    getOwner: 'get-owner'
  }
};

export const IPFS = {
  gateway: 'https://ipfs.io/ipfs/',
  pinningService: 'https://api.pinata.cloud/pinning/',
  timeout: 60000 // 60 seconds
};

export const ERROR_MESSAGES = {
  CONTRACT: {
    NOT_AUTHORIZED: 'You are not authorized to perform this action',
    PATIENT_NOT_FOUND: 'Patient record not found',
    INVALID_INPUT: 'Invalid input provided',
    ALREADY_EXISTS: 'Record already exists',
    ACCESS_DENIED: 'Access denied',
    LIST_FULL: 'Access list is full'
  },
  AUTH: {
    NOT_AUTHENTICATED: 'Please connect your wallet to continue',
    WALLET_CONNECTION_FAILED: 'Failed to connect wallet',
    SESSION_EXPIRED: 'Your session has expired'
  },
  IPFS: {
    UPLOAD_FAILED: 'Failed to upload file to IPFS',
    RETRIEVE_FAILED: 'Failed to retrieve file from IPFS',
    INVALID_CID: 'Invalid IPFS content identifier'
  }
};

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const ACCESS_STATUS = {
  GRANTED: 'granted',
  PENDING: 'pending',
  REVOKED: 'revoked',
  NONE: 'none'
} as const;

export const RECORD_TYPES = [
  'General Checkup',
  'Laboratory Test',
  'Prescription',
  'Surgery',
  'Vaccination',
  'Imaging',
  'Consultation',
  'Emergency'
] as const;
