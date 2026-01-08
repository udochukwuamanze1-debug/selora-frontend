import { useState, useCallback, useMemo } from "react";
import {
  encryptFile,
  generateEncryptionKey,
  exportKey,
  importKey,
  decryptFile,
} from "@/lib/encryption";
import {
  uploadToIPFS,
  downloadFromIPFS,
  saveRecordLocally,
  getLocalRecords,
  deleteLocalRecord,
  type StoredRecord,
} from "@/lib/ipfs";
import { toast } from "sonner";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) window.clearTimeout(timeoutId);
  }) as Promise<T>;
}

export type { StoredRecord };

export interface IPFSStoredRecord extends StoredRecord {
  cid?: string;
}

export function useIPFSStorage(walletAddress: string | undefined) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [records, setRecords] = useState<IPFSStoredRecord[]>([]);

  const storagePrefix = useMemo(() => {
    if (!walletAddress) return null;
    return walletAddress;
  }, [walletAddress]);

  // Load records filtered by wallet
  const loadRecords = useCallback(() => {
    if (!storagePrefix) return;
    const stored = getLocalRecords();
    setRecords(stored.filter((r) => r.id.startsWith(storagePrefix)) as IPFSStoredRecord[]);
  }, [storagePrefix]);

  const uploadFile = useCallback(
    async (file: File): Promise<IPFSStoredRecord | null> => {
      if (!walletAddress) {
        toast.error("Wallet not connected");
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
        let cid: string;

        try {
          // Upload to IPFS via Pinata (with timeout)
          const result = await withTimeout(
            uploadToIPFS(encryptedBlob, `${recordId}_${originalName}`),
            30000,
            "IPFS upload"
          );
          cid = result.cid;
          toast.success("File uploaded to IPFS", {
            description: `CID: ${cid.slice(0, 12)}...`,
          });
        } catch (error) {
          console.error("IPFS upload failed:", error);
          toast.error("IPFS upload failed", {
            description: "Please check your connection and try again.",
          });
          return null;
        }

        // Store encryption key securely
        localStorage.setItem(`selora_key_${recordId}`, keyString);

        const record: IPFSStoredRecord = {
          id: recordId,
          cid,
          iv,
          originalName,
          mimeType,
          uploadedAt: new Date().toISOString(),
          size: file.size,
        };

        saveRecordLocally(record);
        setRecords((prev) => [...prev, record]);

        return record;
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload file");
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [walletAddress]
  );

  const downloadFile = useCallback(async (record: IPFSStoredRecord): Promise<Blob | null> => {
    setIsDownloading(true);
    try {
      // Get encryption key
      const keyString = localStorage.getItem(`selora_key_${record.id}`);
      if (!keyString) {
        toast.error("Encryption key not found");
        return null;
      }

      const key = await importKey(keyString);

      if (!record.cid) {
        toast.error("File CID not found");
        return null;
      }

      // Download from IPFS (with timeout)
      const encryptedBlob = await withTimeout(
        downloadFromIPFS(record.cid),
        30000,
        "IPFS download"
      );

      if (!encryptedBlob) {
        toast.error("File not found on IPFS");
        return null;
      }

      // Decrypt
      const decryptedBlob = await decryptFile(encryptedBlob, key, record.iv, record.mimeType);

      return decryptedBlob;
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
      return null;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const deleteRecord = useCallback((recordId: string) => {
    // Remove key
    localStorage.removeItem(`selora_key_${recordId}`);
    // Remove local blob if present
    localStorage.removeItem(`selora_blob_${recordId}`);
    // Remove metadata record
    deleteLocalRecord(recordId);
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
  }, []);

  // Upload raw data directly
  const uploadData = useCallback(
    async (
      data: ArrayBuffer | string,
      fileName: string,
      mimeType: string
    ): Promise<{ cid: string } | null> => {
      if (!walletAddress) {
        toast.error("Wallet not connected");
        return null;
      }

      setIsUploading(true);
      try {
        const buffer =
          typeof data === "string" ? new TextEncoder().encode(data).buffer : data;
        const blob = new Blob([buffer], { type: mimeType });

        const recordId = `${walletAddress}_${Date.now()}`;

        const result = await withTimeout(
          uploadToIPFS(blob, `${recordId}_${fileName}`),
          30000,
          "IPFS upload"
        );
        const cid = result.cid;

        // Store record metadata
        const record: IPFSStoredRecord = {
          id: recordId,
          cid,
          iv: "",
          originalName: fileName,
          mimeType,
          uploadedAt: new Date().toISOString(),
          size: blob.size,
        };

        saveRecordLocally(record);
        setRecords((prev) => [...prev, record]);

        return { cid };
      } catch (error) {
        console.error("Upload data failed:", error);
        toast.error("Failed to upload data");
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [walletAddress]
  );

  return {
    records,
    isUploading,
    isDownloading,
    uploadFile,
    uploadData,
    downloadFile,
    loadRecords,
    deleteRecord,
  };
}
