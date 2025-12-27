import { useState } from 'react';
import { encryptFile, generateEncryptionKey, exportKey, importKey, decryptFile } from '@/lib/encryption';
import { 
  uploadToWalrus, 
  downloadFromWalrus, 
  saveRecordLocally, 
  getLocalRecords,
  storeEncryptedBlobLocally,
  getEncryptedBlobLocally,
  StoredRecord 
} from '@/lib/walrus';
import { toast } from 'sonner';

export function useWalrusStorage(walletAddress: string | undefined) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [records, setRecords] = useState<StoredRecord[]>([]);

  // Load records on init
  const loadRecords = () => {
    if (!walletAddress) return;
    const stored = getLocalRecords();
    setRecords(stored.filter(r => r.id.startsWith(walletAddress)));
  };

  const uploadFile = async (file: File): Promise<StoredRecord | null> => {
    if (!walletAddress) {
      toast.error('Wallet not connected');
      return null;
    }

    setIsUploading(true);
    try {
      // Generate encryption key
      const key = await generateEncryptionKey();
      const keyString = await exportKey(key);
      
      // Encrypt the file
      const { encryptedBlob, iv, originalName, mimeType } = await encryptFile(file, key);
      
      const recordId = `${walletAddress}_${Date.now()}`;
      let blobId: string;
      
      try {
        // Try uploading to Walrus
        const result = await uploadToWalrus(encryptedBlob);
        blobId = result.blobId;
        toast.success('File uploaded to Walrus');
      } catch (error) {
        // Fallback to local storage
        console.warn('Walrus upload failed, using local storage:', error);
        blobId = `local_${recordId}`;
        await storeEncryptedBlobLocally(recordId, encryptedBlob);
        toast.info('Stored locally (Walrus unavailable)');
      }
      
      // Store encryption key securely (in production, use wallet-based encryption)
      localStorage.setItem(`selora_key_${recordId}`, keyString);
      
      const record: StoredRecord = {
        id: recordId,
        blobId,
        iv,
        originalName,
        mimeType,
        uploadedAt: new Date().toISOString(),
        size: file.size,
      };
      
      saveRecordLocally(record);
      setRecords(prev => [...prev, record]);
      
      return record;
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload file');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const downloadFile = async (record: StoredRecord): Promise<Blob | null> => {
    setIsDownloading(true);
    try {
      // Get encryption key
      const keyString = localStorage.getItem(`selora_key_${record.id}`);
      if (!keyString) {
        toast.error('Encryption key not found');
        return null;
      }
      
      const key = await importKey(keyString);
      
      let encryptedBlob: Blob | null;
      
      if (record.blobId.startsWith('local_')) {
        // Retrieve from local storage
        encryptedBlob = await getEncryptedBlobLocally(record.id);
      } else {
        // Download from Walrus
        encryptedBlob = await downloadFromWalrus(record.blobId);
      }
      
      if (!encryptedBlob) {
        toast.error('File not found');
        return null;
      }
      
      // Decrypt
      const decryptedBlob = await decryptFile(encryptedBlob, key, record.iv, record.mimeType);
      
      return decryptedBlob;
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download file');
      return null;
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    records,
    isUploading,
    isDownloading,
    uploadFile,
    downloadFile,
    loadRecords,
  };
}
