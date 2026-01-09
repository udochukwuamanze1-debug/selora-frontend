// Wallet keyphrase/mnemonic secure storage
// Uses real BIP-39 mnemonics for wallet generation

import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

const VAULT_KEYPHRASES_KEY = 'selora_vault_keyphrases';
const NOTIFICATIONS_KEY = 'selora_local_notifications';

export interface StoredKeyphrase {
  walletAddress: string;
  encryptedMnemonic: string;
  createdAt: string;
  backedUp: boolean;
  emailSent: boolean;
}

export interface LocalNotification {
  id: string;
  type: 'keyphrase' | 'access' | 'prescription' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// ==================== Mnemonic Generation ====================

/**
 * Generate a valid BIP-39 mnemonic (12 words)
 * Uses cryptographically secure random generation
 */
export function generateMnemonic(): string {
  // Generate 128 bits of entropy for 12 words
  return bip39.generateMnemonic(wordlist, 128);
}

/**
 * Validate if a mnemonic is a valid BIP-39 mnemonic
 */
export function isValidMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic, wordlist);
}

// ==================== Encryption/Decryption ====================

/**
 * AES-GCM encryption using Web Crypto API
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptMnemonic(mnemonic: string, walletAddress: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const key = await deriveKey(`selora_${walletAddress}`, salt);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(mnemonic)
  );
  
  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

async function decryptMnemonic(encryptedData: string, walletAddress: string): Promise<string> {
  try {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);
    
    const key = await deriveKey(`selora_${walletAddress}`, salt);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch {
    // Fallback for legacy simple encryption
    return simpleDecrypt(encryptedData, `selora_${walletAddress.slice(0, 16)}`);
  }
}

// Legacy decryption for backwards compatibility
function simpleDecrypt(encrypted: string, key: string): string {
  try {
    const decoded = atob(encrypted);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  } catch {
    return '';
  }
}

// ==================== Vault Storage ====================

function getStoredKeyphrases(): StoredKeyphrase[] {
  try {
    const stored = localStorage.getItem(VAULT_KEYPHRASES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveKeyphrases(keyphrases: StoredKeyphrase[]): void {
  localStorage.setItem(VAULT_KEYPHRASES_KEY, JSON.stringify(keyphrases));
}

/**
 * Store a new wallet keyphrase in the vault with AES-GCM encryption
 */
export async function storeKeyphraseInVault(
  walletAddress: string,
  mnemonic: string
): Promise<void> {
  const keyphrases = getStoredKeyphrases();
  
  // Check if already exists
  const existing = keyphrases.find((k) => k.walletAddress === walletAddress);
  if (existing) {
    console.log('Keyphrase already stored for this wallet');
    return;
  }

  const encryptedMnemonic = await encryptMnemonic(mnemonic, walletAddress);

  keyphrases.push({
    walletAddress,
    encryptedMnemonic,
    createdAt: new Date().toISOString(),
    backedUp: false,
    emailSent: false,
  });

  saveKeyphrases(keyphrases);

  // Create notification about keyphrase storage
  addLocalNotification({
    type: 'keyphrase',
    title: 'Recovery Phrase Generated',
    message: 'Your wallet recovery phrase has been securely stored. Please back it up immediately!',
    data: { walletAddress },
  });
}

/**
 * Retrieve keyphrase from vault
 */
export async function getKeyphraseFromVault(walletAddress: string): Promise<string | null> {
  const keyphrases = getStoredKeyphrases();
  const stored = keyphrases.find((k) => k.walletAddress === walletAddress);
  
  if (!stored) return null;

  return decryptMnemonic(stored.encryptedMnemonic, walletAddress);
}

/**
 * Synchronous version for backwards compatibility
 */
export function getKeyphraseFromVaultSync(walletAddress: string): string | null {
  const keyphrases = getStoredKeyphrases();
  const stored = keyphrases.find((k) => k.walletAddress === walletAddress);
  
  if (!stored) return null;

  // Try legacy decryption first
  const encryptionKey = `selora_${walletAddress.slice(0, 16)}`;
  return simpleDecrypt(stored.encryptedMnemonic, encryptionKey);
}

export function hasKeyphraseInVault(walletAddress: string): boolean {
  const keyphrases = getStoredKeyphrases();
  return keyphrases.some((k) => k.walletAddress === walletAddress);
}

export function markKeyphraseBackedUp(walletAddress: string): void {
  const keyphrases = getStoredKeyphrases();
  const index = keyphrases.findIndex((k) => k.walletAddress === walletAddress);
  if (index >= 0) {
    keyphrases[index].backedUp = true;
    saveKeyphrases(keyphrases);
  }
}

export function getKeyphraseBackupStatus(walletAddress: string): {
  exists: boolean;
  backedUp: boolean;
  emailSent: boolean;
} {
  const keyphrases = getStoredKeyphrases();
  const stored = keyphrases.find((k) => k.walletAddress === walletAddress);
  
  return {
    exists: !!stored,
    backedUp: stored?.backedUp ?? false,
    emailSent: stored?.emailSent ?? false,
  };
}

// ==================== Local Notifications ====================

export function getLocalNotifications(): LocalNotification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveNotifications(notifications: LocalNotification[]): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function addLocalNotification(
  notification: Omit<LocalNotification, 'id' | 'read' | 'createdAt'>
): void {
  const notifications = getLocalNotifications();
  
  notifications.unshift({
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  if (notifications.length > 50) {
    notifications.splice(50);
  }

  saveNotifications(notifications);
}

export function markNotificationRead(id: string): void {
  const notifications = getLocalNotifications();
  const index = notifications.findIndex((n) => n.id === id);
  if (index >= 0) {
    notifications[index].read = true;
    saveNotifications(notifications);
  }
}

export function getUnreadCount(): number {
  return getLocalNotifications().filter((n) => !n.read).length;
}

export function deleteNotification(id: string): void {
  const notifications = getLocalNotifications();
  const filtered = notifications.filter((n) => n.id !== id);
  saveNotifications(filtered);
}

// ==================== Wallet Creation Flow ====================

/**
 * Generate and store a new wallet's mnemonic
 * Returns the mnemonic for display to user (one-time only)
 */
export async function generateAndStoreWalletMnemonic(walletAddress: string): Promise<string> {
  const mnemonic = generateMnemonic();
  await storeKeyphraseInVault(walletAddress, mnemonic);
  return mnemonic;
}

export function formatMnemonicForEmail(mnemonic: string): string {
  const words = mnemonic.split(' ');
  return words.map((word, i) => `${i + 1}. ${word}`).join('\n');
}

// ==================== Wallet Import ====================

/**
 * Import a wallet from an existing mnemonic
 * Returns the derived wallet address if successful
 */
export async function importWalletFromMnemonic(mnemonic: string): Promise<{
  success: boolean;
  walletAddress?: string;
  error?: string;
}> {
  // Normalize mnemonic (trim, lowercase, single spaces)
  const normalized = mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');
  
  // Validate the mnemonic
  if (!isValidMnemonic(normalized)) {
    return { success: false, error: 'Invalid recovery phrase. Please check your 12 words.' };
  }
  
  try {
    // Import Ed25519Keypair dynamically to derive address
    const { Ed25519Keypair } = await import('@iota/iota-sdk/keypairs/ed25519');
    
    // Derive keypair from mnemonic using standard derivation path
    const keypair = Ed25519Keypair.deriveKeypair(normalized);
    const walletAddress = keypair.getPublicKey().toIotaAddress();
    
    // Store the mnemonic in vault
    await storeKeyphraseInVault(walletAddress, normalized);
    
    // Mark as backed up since user already has it
    markKeyphraseBackedUp(walletAddress);
    
    return { success: true, walletAddress };
  } catch (error) {
    console.error('Failed to import wallet:', error);
    return { success: false, error: 'Failed to derive wallet from recovery phrase.' };
  }
}
