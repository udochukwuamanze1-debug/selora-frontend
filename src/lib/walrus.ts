// Walrus decentralized storage integration
import { WALRUS_CONFIG } from '@/config/constants';

export interface WalrusUploadResult {
  blobId: string;
  endEpoch: number;
  suiRefType: string;
  suiRef: string;
  suiBaseUrl: string;
}

export interface StoredRecord {
  id: string;
  blobId: string;
  iv: string;
  originalName: string;
  mimeType: string;
  uploadedAt: string;
  size: number;
}

/**
 * Upload encrypted data to Walrus
 */
export async function uploadToWalrus(
  encryptedBlob: Blob,
  epochs?: number
): Promise<WalrusUploadResult> {
  const url = new URL('/v1/store', WALRUS_CONFIG.PUBLISHER_URL);
  if (epochs) {
    url.searchParams.set('epochs', epochs.toString());
  }

  const response = await fetch(url.toString(), {
    method: 'PUT',
    body: encryptedBlob,
  });

  if (!response.ok) {
    throw new Error(`Walrus upload failed: ${response.statusText}`);
  }

  const result = await response.json();
  
  // Handle both newlyCreated and alreadyCertified responses
  if (result.newlyCreated) {
    return {
      blobId: result.newlyCreated.blobObject.blobId,
      endEpoch: result.newlyCreated.blobObject.storage.endEpoch,
      suiRefType: 'newlyCreated',
      suiRef: result.newlyCreated.blobObject.id,
      suiBaseUrl: WALRUS_CONFIG.AGGREGATOR_URL,
    };
  } else if (result.alreadyCertified) {
    return {
      blobId: result.alreadyCertified.blobId,
      endEpoch: result.alreadyCertified.endEpoch,
      suiRefType: 'alreadyCertified',
      suiRef: result.alreadyCertified.event.txDigest,
      suiBaseUrl: WALRUS_CONFIG.AGGREGATOR_URL,
    };
  }
  
  throw new Error('Unexpected Walrus response format');
}

/**
 * Download data from Walrus
 */
export async function downloadFromWalrus(blobId: string): Promise<Blob> {
  const url = `${WALRUS_CONFIG.AGGREGATOR_URL}/v1/${blobId}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Walrus download failed: ${response.statusText}`);
  }
  
  return await response.blob();
}

/**
 * Store record metadata in local storage (fallback when Walrus unavailable)
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
