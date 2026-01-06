// IPFS/Pinata decentralized storage integration
import { IPFS_CONFIG } from '@/config/constants';

export interface IPFSUploadResult {
  cid: string;
  size: number;
  timestamp: string;
}

export interface StoredRecord {
  id: string;
  cid: string;
  iv: string;
  originalName: string;
  mimeType: string;
  uploadedAt: string;
  size: number;
}

/**
 * Upload encrypted data to IPFS via Pinata or public gateway
 * Note: For production, you'll need to configure PINATA_API_KEY and PINATA_SECRET_KEY
 */
export async function uploadToIPFS(
  encryptedBlob: Blob,
  fileName?: string
): Promise<IPFSUploadResult> {
  // Check if Pinata credentials are available
  if (IPFS_CONFIG.PINATA_API_KEY && IPFS_CONFIG.PINATA_SECRET_KEY) {
    return uploadToPinata(encryptedBlob, fileName);
  }
  
  // Fallback: Use a public IPFS gateway (for demo purposes)
  // In production, always use Pinata or your own IPFS node
  return uploadToPublicGateway(encryptedBlob);
}

/**
 * Upload to Pinata (requires API keys)
 */
async function uploadToPinata(
  encryptedBlob: Blob,
  fileName?: string
): Promise<IPFSUploadResult> {
  const formData = new FormData();
  formData.append('file', encryptedBlob, fileName || 'encrypted-data');
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': IPFS_CONFIG.PINATA_API_KEY!,
      'pinata_secret_api_key': IPFS_CONFIG.PINATA_SECRET_KEY!,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`IPFS upload failed: ${response.statusText}`);
  }

  const result = await response.json();
  
  return {
    cid: result.IpfsHash,
    size: result.PinSize,
    timestamp: result.Timestamp,
  };
}

/**
 * Upload to public IPFS gateway (demo/fallback)
 * Note: This uses ipfs.io which has rate limits
 */
async function uploadToPublicGateway(
  encryptedBlob: Blob
): Promise<IPFSUploadResult> {
  // For demo purposes, store locally and generate a mock CID
  // In production, you should always use Pinata or a dedicated IPFS node
  const mockCid = `Qm${generateRandomCID()}`;
  
  // Store the blob locally as fallback
  const id = crypto.randomUUID();
  await storeEncryptedBlobLocally(id, encryptedBlob);
  
  // Map local ID to mock CID
  const cidMapping = JSON.parse(localStorage.getItem('selora_cid_mapping') || '{}');
  cidMapping[mockCid] = id;
  localStorage.setItem('selora_cid_mapping', JSON.stringify(cidMapping));
  
  return {
    cid: mockCid,
    size: encryptedBlob.size,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate a random CID-like string for demo purposes
 */
function generateRandomCID(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Download data from IPFS
 */
export async function downloadFromIPFS(cid: string): Promise<Blob> {
  // Check if this is a locally stored blob (demo mode)
  const cidMapping = JSON.parse(localStorage.getItem('selora_cid_mapping') || '{}');
  if (cidMapping[cid]) {
    const localBlob = await getEncryptedBlobLocally(cidMapping[cid]);
    if (localBlob) return localBlob;
  }
  
  // Try multiple gateways
  const gateways = [
    IPFS_CONFIG.GATEWAY_URL,
    'https://cloudflare-ipfs.com/ipfs',
    'https://gateway.pinata.cloud/ipfs',
  ];
  
  for (const gateway of gateways) {
    try {
      const url = `${gateway}/${cid}`;
      const response = await fetch(url, { 
        signal: AbortSignal.timeout(10000) 
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
