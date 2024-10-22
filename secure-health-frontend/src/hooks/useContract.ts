import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SignedContractCallOptions } from '@stacks/transactions';
// import { AnchorMode, makeContractCall, broadcastTransaction, SignedContractCallOptions } from '@stacks/transactions';
// import { stringUtf8CV, stringAsciiCV, uintCV, UIntCV, StringAsciiCV, StringUtf8CV } from '@stacks/transactions';
import { 
  fetchCallReadOnlyFunction,
  contractPrincipalCV,
  stringAsciiCV,
  stringUtf8CV,
  uintCV,
  bufferCV,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  standardPrincipalCV,
  TxBroadcastResult,
  cvToValue
} from '@stacks/transactions';
import { StacksTestnet, StacksNetwork } from '@stacks/network';

const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = 'PatientRecord';
const network: StacksNetwork = new StacksTestnet();


export interface PatientRecord {
  patientId: string;
  recordHash: string;
  name: string;
  dateOfBirth: number;
  bloodType: string;
  lastUpdated: number;
  isActive: boolean;
  owner: string;
}

export interface AccessRequest {
  status: string;
  requestedAt: number;
}

export function useContract() {
  const { userSession } = useAuth();

  const getPatientRecord = useCallback(async (patientId: string): Promise<PatientRecord> => {
    try {
      const result = await fetchCallReadOnlyFunction({

        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-patient-record',
        functionArgs: [stringUtf8CV(patientId)],
        senderAddress: userSession.loadUserData().profile.stxAddress.testnet
      });
      
      return cvToValue(result) as unknown as PatientRecord;
    } catch (error) {
      console.error('Error getting patient record:', error);
      throw new Error('Failed to fetch patient record');
    }
  }, [userSession]);

  const getAccessRequest = useCallback(async (patientId: string, requester: string): Promise<AccessRequest | null> => {
    try {
      const result = await fetchCallReadOnlyFunction({

        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-access-request',
        functionArgs: [
          stringUtf8CV(patientId),
          standardPrincipalCV(requester)
        ],
        senderAddress: userSession.loadUserData().profile.stxAddress.testnet
      });
      
      return cvToValue(result) as unknown as AccessRequest;
    } catch (error) {
      console.error('Error getting access request:', error);
      throw new Error('Failed to fetch access request');
    }
  }, [userSession]);

  const registerPatient = useCallback(async (
    patientId: string,
    name: string,
    dateOfBirth: number,
    bloodType: string
  ): Promise<TxBroadcastResult> => {
    try {
      const txOptions: SignedContractCallOptions = {
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'register-patient',
        functionArgs: [
          stringUtf8CV(patientId),
          stringUtf8CV(name),
          uintCV(dateOfBirth),
          stringAsciiCV(bloodType)
        ],
        senderKey: userSession.loadUserData().appPrivateKey,
        validateWithAbi: true,
        postConditions: []
      };

      const transaction = await makeContractCall(txOptions);
      return broadcastTransaction(transaction, network);
    } catch (error) {
      console.error('Error registering patient:', error);
      throw new Error('Failed to register patient');
    }
  }, [userSession]);

  const updatePatientRecord = useCallback(async (
    patientId: string,
    recordHash: string
  ): Promise<TxBroadcastResult> => {
    try {
      const txOptions: SignedContractCallOptions = {
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'update-patient-record',
        functionArgs: [
          stringUtf8CV(patientId),
          bufferCV(Buffer.from(recordHash, 'hex'))
        ],
        senderKey: userSession.loadUserData().appPrivateKey,
        validateWithAbi: true,
        postConditions: []
      };

      const transaction = await makeContractCall(txOptions);
      return broadcastTransaction(transaction, network);
    } catch (error) {
      console.error('Error updating patient record:', error);
      throw new Error('Failed to update patient record');
    }
  }, [userSession]);

  const requestAccess = useCallback(async (patientId: string): Promise<TxBroadcastResult> => {
    try {
      const txOptions: SignedContractCallOptions = {
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'request-access',
        functionArgs: [stringUtf8CV(patientId)],
        senderKey: userSession.loadUserData().appPrivateKey,
        validateWithAbi: true,
        postConditions: []
      };

      const transaction = await makeContractCall(txOptions);
      return broadcastTransaction(transaction, network);
    } catch (error) {
      console.error('Error requesting access:', error);
      throw new Error('Failed to request access');
    }
  }, [userSession]);

  const grantAccess = useCallback(async (
    patientId: string,
    provider: string
  ): Promise<TxBroadcastResult> => {
    try {
      const txOptions: SignedContractCallOptions = {
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'grant-access',
        functionArgs: [
          stringUtf8CV(patientId),
          standardPrincipalCV(provider)
        ],
        senderKey: userSession.loadUserData().appPrivateKey,
        validateWithAbi: true,
        postConditions: []
      };

      const transaction = await makeContractCall(txOptions);
      return broadcastTransaction(transaction, network);
    } catch (error) {
      console.error('Error granting access:', error);
      throw new Error('Failed to grant access');
    }
  }, [userSession]);

  const revokeAccess = useCallback(async (
    patientId: string,
    provider: string
  ): Promise<TxBroadcastResult> => {
    try {
      const txOptions: SignedContractCallOptions = {
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'revoke-access',
        functionArgs: [
          stringUtf8CV(patientId),
          standardPrincipalCV(provider)
        ],
        senderKey: userSession.loadUserData().appPrivateKey,
        validateWithAbi: true,
        postConditions: []
      };

      const transaction = await makeContractCall(txOptions);
      return broadcastTransaction(transaction, network);
    } catch (error) {
      console.error('Error revoking access:', error);
      throw new Error('Failed to revoke access');
    }
  }, [userSession]);

  return {
    getPatientRecord,
    getAccessRequest,
    registerPatient,
    updatePatientRecord,
    requestAccess,
    grantAccess,
    revokeAccess
  };
}
