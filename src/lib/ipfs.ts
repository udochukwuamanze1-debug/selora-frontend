// IPFS/Pinata decentralized storage integration
import { IPFS_CONFIG } from '@/config/constants';

export interface IPFSUploadResult {
  cid: string;
  size: number;
  timestamp: string;
}

export interface StoredRecord {
  id: string;
  cid?: string;
  iv: string;
  originalName: string;
  mimeType: string;
  uploadedAt: string;
  size: number;
}

/**
 * Upload encrypted data to IPFS via Pinata
 */
export async function uploadToIPFS(
  encryptedBlob: Blob,
  fileName?: string
): Promise<IPFSUploadResult> {
  const formData = new FormData();
  formData.append('file', encryptedBlob, fileName || 'encrypted-data');
  
  // Add pinata metadata for better organization
  const metadata = JSON.stringify({
    name: fileName || 'selora-health-record',
    keyvalues: {
      app: 'selora',
      timestamp: new Date().toISOString(),
    }
  });
  formData.append('pinataMetadata', metadata);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': IPFS_CONFIG.PINATA_API_KEY,
      'pinata_secret_api_key': IPFS_CONFIG.PINATA_SECRET_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`IPFS upload failed: ${response.statusText} - ${error}`);
  }

  const result = await response.json();
  
  return {
    cid: result.IpfsHash,
    size: result.PinSize,
    timestamp: result.Timestamp,
  };
}

/**
 * Download data from IPFS via multiple gateways
 */
export async function downloadFromIPFS(cid: string): Promise<Blob> {
  // Check if this is a locally stored blob (fallback mode)
  const cidMapping = JSON.parse(localStorage.getItem('selora_cid_mapping') || '{}');
  if (cidMapping[cid]) {
    const localBlob = await getEncryptedBlobLocally(cidMapping[cid]);
    if (localBlob) return localBlob;
  }
  
  // Try multiple gateways for reliability
  const gateways = [
    IPFS_CONFIG.GATEWAY_URL,
    'https://cloudflare-ipfs.com/ipfs',
    'https://ipfs.io/ipfs',
    'https://dweb.link/ipfs',
  ];
  
  for (const gateway of gateways) {
    try {
      const url = `${gateway}/${cid}`;
      const response = await fetch(url, { 
        signal: AbortSignal.timeout(15000) 
      });
      
      if (response.ok) {
        return await response.blob();
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${gateway}:`, error);
      continue;
    }
  }
  
  throw new Error(`IPFS download failed: Could not fetch CID ${cid}`);
}

/**
 * Store record metadata in local storage
 */
export function saveRecordLocally(record: StoredRecord): void {
  const records = getLocalRecords();
  records.push(record);
  localStorage.setItem('selora_records', JSON.stringify(records));
}

/**
 * Get records from local storage
 */
export function getLocalRecords(): StoredRecord[] {
  const stored = localStorage.getItem('selora_records');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Delete a record from local storage
 */
export function deleteLocalRecord(id: string): void {
  const records = getLocalRecords();
  const filtered = records.filter((r) => r.id !== id);
  localStorage.setItem("selora_records", JSON.stringify(filtered));
}

/**
 * Delete local blob associated with a record
 */
export function deleteLocalBlob(id: string): void {
  localStorage.removeItem(`selora_blob_${id}`);
}

/**
 * Store encrypted blob locally as fallback
 */
export function storeEncryptedBlobLocally(id: string, blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(`selora_blob_${id}`, reader.result as string);
      resolve();
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Retrieve encrypted blob from local storage
 */
export async function getEncryptedBlobLocally(id: string): Promise<Blob | null> {
  const stored = localStorage.getItem(`selora_blob_${id}`);
  if (!stored) return null;
  
  const response = await fetch(stored);
  return await response.blob();
}

/**
 * Unpin a file from Pinata (optional cleanup)
 */
export async function unpinFromIPFS(cid: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      method: 'DELETE',
      headers: {
        'pinata_api_key': IPFS_CONFIG.PINATA_API_KEY,
        'pinata_secret_api_key': IPFS_CONFIG.PINATA_SECRET_KEY,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to unpin from IPFS:', error);
    return false;
  }
}
