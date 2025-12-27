// Client-side AES-256-GCM encryption utilities

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const TAG_LENGTH = 128;

/**
 * Generate a new AES-256 encryption key
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Export key to base64 for storage
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Import key from base64
 */
export async function importKey(base64Key: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'raw',
    raw,
    { name: ALGORITHM },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data with AES-256-GCM
 */
export async function encryptData(
  data: ArrayBuffer,
  key: CryptoKey
): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  const encrypted = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
      tagLength: TAG_LENGTH,
    },
    key,
    data
  );
  
  return { encrypted, iv };
}

/**
 * Decrypt data with AES-256-GCM
 */
export async function decryptData(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  return await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: iv as unknown as BufferSource,
      tagLength: TAG_LENGTH,
    },
    key,
    encryptedData
  );
}

/**
 * Encrypt a file and return encrypted blob with metadata
 */
export async function encryptFile(
  file: File,
  key: CryptoKey
): Promise<{ encryptedBlob: Blob; iv: string; originalName: string; mimeType: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const { encrypted, iv } = await encryptData(arrayBuffer, key);
  
  return {
    encryptedBlob: new Blob([encrypted]),
    iv: btoa(String.fromCharCode(...iv)),
    originalName: file.name,
    mimeType: file.type,
  };
}

/**
 * Decrypt a file blob
 */
export async function decryptFile(
  encryptedBlob: Blob,
  key: CryptoKey,
  iv: string,
  mimeType: string
): Promise<Blob> {
  const arrayBuffer = await encryptedBlob.arrayBuffer();
  const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  const decrypted = await decryptData(arrayBuffer, key, ivArray);
  
  return new Blob([decrypted], { type: mimeType });
}
