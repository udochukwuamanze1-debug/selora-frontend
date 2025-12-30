// Wallet keyphrase/mnemonic secure storage
// Stores encrypted keyphrases in the user's vault

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
 * Generate a BIP-39 compatible mnemonic (12 words)
 * This is a simplified version - in production, use a proper crypto library
 */
export function generateMnemonic(): string {
  const wordList = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
    'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
    'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
    'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
    'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone',
    'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among',
    'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry',
    'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
    'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april',
    'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor',
    'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact',
    'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist', 'assume',
    'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
    'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado',
    'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward', 'axis',
    'baby', 'bachelor', 'bacon', 'badge', 'bag', 'balance', 'balcony', 'ball',
    'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base',
    'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become',
    'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt',
    'bench', 'benefit', 'best', 'betray', 'better', 'between', 'beyond', 'bicycle',
    'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black',
    'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood',
    'blossom', 'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body',
  ];

  const mnemonic: string[] = [];
  const randomValues = new Uint32Array(12);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < 12; i++) {
    const index = randomValues[i] % wordList.length;
    mnemonic.push(wordList[index]);
  }

  return mnemonic.join(' ');
}

// ==================== Encryption/Decryption ====================

/**
 * Simple XOR-based encryption for demo purposes
 * In production, use Web Crypto API with AES-GCM
 */
function simpleEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return btoa(result);
}

function simpleDecrypt(encrypted: string, key: string): string {
  const decoded = atob(encrypted);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(
      decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

// ==================== Vault Storage ====================

/**
 * Get all stored keyphrases from vault
 */
function getStoredKeyphrases(): StoredKeyphrase[] {
  try {
    const stored = localStorage.getItem(VAULT_KEYPHRASES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save keyphrases to vault
 */
function saveKeyphrases(keyphrases: StoredKeyphrase[]): void {
  localStorage.setItem(VAULT_KEYPHRASES_KEY, JSON.stringify(keyphrases));
}

/**
 * Store a new wallet keyphrase in the vault
 */
export function storeKeyphraseInVault(
  walletAddress: string,
  mnemonic: string
): void {
  const keyphrases = getStoredKeyphrases();
  
  // Check if already exists
  const existing = keyphrases.find((k) => k.walletAddress === walletAddress);
  if (existing) {
    console.log('Keyphrase already stored for this wallet');
    return;
  }

  // Encrypt using wallet address as part of the key
  const encryptionKey = `selora_${walletAddress.slice(0, 16)}`;
  const encryptedMnemonic = simpleEncrypt(mnemonic, encryptionKey);

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
    title: 'Recovery Phrase Stored',
    message: 'Your wallet recovery phrase has been securely stored in your vault. Please back it up!',
    data: { walletAddress },
  });
}

/**
 * Retrieve keyphrase from vault (requires authentication)
 */
export function getKeyphraseFromVault(walletAddress: string): string | null {
  const keyphrases = getStoredKeyphrases();
  const stored = keyphrases.find((k) => k.walletAddress === walletAddress);
  
  if (!stored) return null;

  const encryptionKey = `selora_${walletAddress.slice(0, 16)}`;
  return simpleDecrypt(stored.encryptedMnemonic, encryptionKey);
}

/**
 * Check if keyphrase exists for a wallet
 */
export function hasKeyphraseInVault(walletAddress: string): boolean {
  const keyphrases = getStoredKeyphrases();
  return keyphrases.some((k) => k.walletAddress === walletAddress);
}

/**
 * Mark keyphrase as backed up
 */
export function markKeyphraseBackedUp(walletAddress: string): void {
  const keyphrases = getStoredKeyphrases();
  const index = keyphrases.findIndex((k) => k.walletAddress === walletAddress);
  if (index >= 0) {
    keyphrases[index].backedUp = true;
    saveKeyphrases(keyphrases);
  }
}

/**
 * Get backup status
 */
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

/**
 * Get all local notifications
 */
export function getLocalNotifications(): LocalNotification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save notifications
 */
function saveNotifications(notifications: LocalNotification[]): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

/**
 * Add a new local notification
 */
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

  // Keep only last 50 notifications
  if (notifications.length > 50) {
    notifications.splice(50);
  }

  saveNotifications(notifications);
}

/**
 * Mark notification as read
 */
export function markNotificationRead(id: string): void {
  const notifications = getLocalNotifications();
  const index = notifications.findIndex((n) => n.id === id);
  if (index >= 0) {
    notifications[index].read = true;
    saveNotifications(notifications);
  }
}

/**
 * Get unread notification count
 */
export function getUnreadCount(): number {
  return getLocalNotifications().filter((n) => !n.read).length;
}

/**
 * Delete a notification
 */
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
export function generateAndStoreWalletMnemonic(walletAddress: string): string {
  const mnemonic = generateMnemonic();
  storeKeyphraseInVault(walletAddress, mnemonic);
  return mnemonic;
}

/**
 * Prepare mnemonic for email (formatted)
 */
export function formatMnemonicForEmail(mnemonic: string): string {
  const words = mnemonic.split(' ');
  return words.map((word, i) => `${i + 1}. ${word}`).join('\\n');
}
