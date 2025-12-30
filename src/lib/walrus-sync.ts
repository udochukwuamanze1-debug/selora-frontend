// Walrus P2P sync for decentralized data storage
import { WALRUS_CONFIG } from '@/config/constants';
import { uploadToWalrus, downloadFromWalrus } from './walrus';

// Storage keys
const SYNC_REGISTRY_KEY = 'selora_walrus_sync_registry';
const DOCTORS_STORAGE_KEY = 'selora_doctor_profiles';

export interface SyncedProfile {
  id: string;
  type: 'doctor' | 'patient';
  walletAddress: string;
  blobId: string;
  lastSynced: number;
  version: number;
}

export interface DoctorProfileData {
  id: string;
  wallet_address: string;
  full_name: string;
  specialty: string;
  license_number?: string;
  clinic_name?: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  accepts_new_patients: boolean;
  verified: boolean;
  stake_amount?: number;
  subscription_tier?: number;
  created_at: string;
  updated_at: string;
}

// ==================== Sync Registry ====================

function getSyncRegistry(): SyncedProfile[] {
  try {
    const stored = localStorage.getItem(SYNC_REGISTRY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSyncRegistry(registry: SyncedProfile[]): void {
  localStorage.setItem(SYNC_REGISTRY_KEY, JSON.stringify(registry));
}

function updateSyncRegistry(profile: SyncedProfile): void {
  const registry = getSyncRegistry();
  const index = registry.findIndex(
    (p) => p.walletAddress === profile.walletAddress && p.type === profile.type
  );
  if (index >= 0) {
    registry[index] = profile;
  } else {
    registry.push(profile);
  }
  saveSyncRegistry(registry);
}

// ==================== Doctor Profile Sync ====================

/**
 * Get all locally stored doctor profiles
 */
export function getLocalDoctorProfiles(): DoctorProfileData[] {
  try {
    const stored = localStorage.getItem(DOCTORS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save doctor profiles locally
 */
export function saveLocalDoctorProfiles(profiles: DoctorProfileData[]): void {
  localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(profiles));
}

/**
 * Add or update a doctor profile locally
 */
export function upsertLocalDoctorProfile(profile: DoctorProfileData): void {
  const profiles = getLocalDoctorProfiles();
  const index = profiles.findIndex((p) => p.wallet_address === profile.wallet_address);
  if (index >= 0) {
    profiles[index] = { ...profiles[index], ...profile, updated_at: new Date().toISOString() };
  } else {
    profiles.push({
      ...profile,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  saveLocalDoctorProfiles(profiles);
}

/**
 * Upload doctor profile to Walrus for P2P sync
 */
export async function syncDoctorProfileToWalrus(
  profile: DoctorProfileData
): Promise<string> {
  try {
    // Serialize profile to JSON
    const profileJson = JSON.stringify(profile);
    const blob = new Blob([profileJson], { type: 'application/json' });

    // Upload to Walrus
    const result = await uploadToWalrus(blob, WALRUS_CONFIG.DEFAULT_EPOCHS);

    // Update sync registry
    updateSyncRegistry({
      id: profile.id,
      type: 'doctor',
      walletAddress: profile.wallet_address,
      blobId: result.blobId,
      lastSynced: Date.now(),
      version: 1,
    });

    // Store locally as well
    upsertLocalDoctorProfile(profile);

    console.log('Doctor profile synced to Walrus:', result.blobId);
    return result.blobId;
  } catch (error) {
    console.error('Failed to sync doctor profile to Walrus:', error);
    // Fallback to local storage only
    upsertLocalDoctorProfile(profile);
    throw error;
  }
}

/**
 * Fetch doctor profile from Walrus by blob ID
 */
export async function fetchDoctorProfileFromWalrus(
  blobId: string
): Promise<DoctorProfileData | null> {
  try {
    const blob = await downloadFromWalrus(blobId);
    const text = await blob.text();
    return JSON.parse(text) as DoctorProfileData;
  } catch (error) {
    console.error('Failed to fetch doctor profile from Walrus:', error);
    return null;
  }
}

/**
 * Sync all doctor profiles from known blob IDs
 */
export async function syncAllDoctorProfiles(): Promise<DoctorProfileData[]> {
  const registry = getSyncRegistry();
  const doctorEntries = registry.filter((p) => p.type === 'doctor');
  const localProfiles = getLocalDoctorProfiles();

  const synced: DoctorProfileData[] = [];

  for (const entry of doctorEntries) {
    try {
      const profile = await fetchDoctorProfileFromWalrus(entry.blobId);
      if (profile) {
        synced.push(profile);
        upsertLocalDoctorProfile(profile);
      }
    } catch (error) {
      console.warn(`Failed to sync profile ${entry.walletAddress}:`, error);
    }
  }

  // Merge with local profiles that weren't in sync registry
  const allAddresses = new Set(synced.map((p) => p.wallet_address));
  for (const local of localProfiles) {
    if (!allAddresses.has(local.wallet_address)) {
      synced.push(local);
    }
  }

  saveLocalDoctorProfiles(synced);
  return synced;
}

/**
 * Get verified doctors (for Care Network)
 */
export function getVerifiedDoctors(): DoctorProfileData[] {
  return getLocalDoctorProfiles().filter((d) => d.verified);
}

/**
 * Share sync registry entry with another device (generates shareable data)
 */
export function generateSyncShareData(walletAddress: string): string | null {
  const registry = getSyncRegistry();
  const entry = registry.find((p) => p.walletAddress === walletAddress);
  if (!entry) return null;
  return btoa(JSON.stringify(entry));
}

/**
 * Import sync entry from shared data
 */
export async function importSyncShareData(shareData: string): Promise<boolean> {
  try {
    const entry = JSON.parse(atob(shareData)) as SyncedProfile;
    if (!entry.blobId || !entry.walletAddress) return false;

    // Fetch the profile from Walrus
    if (entry.type === 'doctor') {
      const profile = await fetchDoctorProfileFromWalrus(entry.blobId);
      if (profile) {
        upsertLocalDoctorProfile(profile);
        updateSyncRegistry(entry);
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

// ==================== Global Doctors Registry on Walrus ====================

const GLOBAL_REGISTRY_KEY = 'selora_global_doctors_blob';

/**
 * Upload the entire doctors list to Walrus (for discovery)
 */
export async function publishGlobalDoctorsRegistry(): Promise<string> {
  const doctors = getVerifiedDoctors();
  const registryData = {
    version: Date.now(),
    doctors: doctors.map((d) => ({
      id: d.id,
      wallet_address: d.wallet_address,
      full_name: d.full_name,
      specialty: d.specialty,
      city: d.city,
      country: d.country,
      lat: d.lat,
      lon: d.lon,
      accepts_new_patients: d.accepts_new_patients,
    })),
  };

  const blob = new Blob([JSON.stringify(registryData)], { type: 'application/json' });
  const result = await uploadToWalrus(blob, WALRUS_CONFIG.DEFAULT_EPOCHS);

  localStorage.setItem(GLOBAL_REGISTRY_KEY, result.blobId);
  return result.blobId;
}

/**
 * Fetch global doctors registry from Walrus
 */
export async function fetchGlobalDoctorsRegistry(
  blobId?: string
): Promise<DoctorProfileData[]> {
  const storedBlobId = blobId || localStorage.getItem(GLOBAL_REGISTRY_KEY);
  if (!storedBlobId) return getLocalDoctorProfiles();

  try {
    const blob = await downloadFromWalrus(storedBlobId);
    const text = await blob.text();
    const data = JSON.parse(text);
    return data.doctors || [];
  } catch (error) {
    console.error('Failed to fetch global registry:', error);
    return getLocalDoctorProfiles();
  }
}
