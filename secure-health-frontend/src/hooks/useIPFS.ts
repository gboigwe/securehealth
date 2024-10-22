import { useState, useCallback } from 'react';
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';

interface IPFSFile {
  cid: string;
  path: string;
  size: number;
}

const INFURA_PROJECT_ID = 'MY_INFURA_PROJECT_ID';
const INFURA_PROJECT_SECRET = 'MY_INFURA_PROJECT_SECRET';

export function useIPFS() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize IPFS client
  const getIPFSClient = useCallback((): IPFSHTTPClient => {
    const auth = 'Basic ' + Buffer.from(INFURA_PROJECT_ID + ':' + INFURA_PROJECT_SECRET).toString('base64');
    
    return create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth,
      },
    });
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const ipfs = getIPFSClient();
      
      // Encrypt file before uploading (in production, implement encryption)
      const encryptedBuffer = await file.arrayBuffer();
      
      const result = await ipfs.add(Buffer.from(encryptedBuffer));
      return result.path;
    } catch (err) {
      console.error('Error uploading to IPFS:', err);
      setError('Failed to upload file to IPFS');
      throw new Error('Failed to upload file to IPFS');
    } finally {
      setIsLoading(false);
    }
  }, [getIPFSClient]);

  const uploadJSON = useCallback(async (data: any): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const ipfs = getIPFSClient();
      
      // Encrypt data before uploading (in production, implement encryption)
      const jsonString = JSON.stringify(data);
      
      const result = await ipfs.add(Buffer.from(jsonString));
      return result.path;
    } catch (err) {
      console.error('Error uploading JSON to IPFS:', err);
      setError('Failed to upload JSON to IPFS');
      throw new Error('Failed to upload JSON to IPFS');
    } finally {
      setIsLoading(false);
    }
  }, [getIPFSClient]);

  const retrieveFile = useCallback(async (cid: string): Promise<Buffer> => {
    setIsLoading(true);
    setError(null);

    try {
      const ipfs = getIPFSClient();
      
      const chunks = [];
      for await (const chunk of ipfs.cat(cid)) {
        chunks.push(chunk);
      }
      
      // Decrypt data before returning (in production, implement decryption)
      return Buffer.concat(chunks);
    } catch (err) {
      console.error('Error retrieving from IPFS:', err);
      setError('Failed to retrieve file from IPFS');
      throw new Error('Failed to retrieve file from IPFS');
    } finally {
      setIsLoading(false);
    }
  }, [getIPFSClient]);

  const retrieveJSON = useCallback(async (cid: string): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const buffer = await retrieveFile(cid);
      // Decrypt data before parsing (in production, implement decryption)
      const jsonString = buffer.toString();
      return JSON.parse(jsonString);
    } catch (err) {
      console.error('Error retrieving JSON from IPFS:', err);
      setError('Failed to retrieve JSON from IPFS');
      throw new Error('Failed to retrieve JSON from IPFS');
    } finally {
      setIsLoading(false);
    }
  }, [retrieveFile]);

  return {
    uploadFile,
    uploadJSON,
    retrieveFile,
    retrieveJSON,
    isLoading,
    error
  };
}
