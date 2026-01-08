/**
 * zkLogin helper utilities for IOTA using Google OAuth.
 * Provides a deterministic wallet address based on Google identity.
 * Session persists across logins using the same Google account.
 */
import { Ed25519Keypair } from "@iota/iota-sdk/keypairs/ed25519";
import { IotaClient, getFullnodeUrl } from "@iota/iota-sdk/client";
import { jwtDecode } from "jwt-decode";

// ----------------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------------

export const GOOGLE_CLIENT_ID =
  "391574072796-i6ban2nd2fumh1imjmhljl6bpek7himc.apps.googleusercontent.com";

const REDIRECT_URI =
  typeof window !== "undefined"
    ? `${window.location.origin}/auth/callback`
    : "https://tryselora.vercel.app/auth/callback";

// Static salt for address derivation - combined with Google sub for determinism
const STATIC_SALT = "selora_iota_health_v1_129390038577185583942388216820280642146";

// The IotaClient for network interactions
const iotaClient = new IotaClient({ url: getFullnodeUrl("testnet") });

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface ZkLoginState {
  ephemeralKeyPair: {
    publicKey: string;
    secretKey: string;
  };
  randomness: string;
  nonce: string;
  maxEpoch: number;
  jwt?: string;
  address?: string;
  salt: string;
  googleEmail?: string;
  googleName?: string;
  googleSub?: string; // Store Google's unique user ID for session persistence
  createdAt: number;
}

interface JwtPayload {
  iss: string;
  aud: string;
  sub: string;
  nonce: string;
  exp: number;
  iat: number;
  email?: string;
  name?: string;
}

// ----------------------------------------------------------------------------
// Base64 helpers (browser-compatible)
// ----------------------------------------------------------------------------

function bytesToBase64(input: Uint8Array | ArrayLike<number>): string {
  const bytes = input instanceof Uint8Array ? input : Uint8Array.from(input);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Deterministic hash for address generation
async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate deterministic seed bytes from a string
async function deterministicSeedBytes(seed: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

// ----------------------------------------------------------------------------
// Storage helpers - persist by Google sub (user ID) for cross-session support
// ----------------------------------------------------------------------------

const STORAGE_KEY = "selora_zklogin_state";
const USER_INDEX_KEY = "selora_zklogin_users";

export function saveZkLoginState(state: ZkLoginState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  
  // Also index by Google sub for user lookup
  if (state.googleSub) {
    const userKey = `selora_zklogin_user_${state.googleSub}`;
    localStorage.setItem(userKey, JSON.stringify(state));
    
    // Update user index
    const indexStr = localStorage.getItem(USER_INDEX_KEY);
    const index: string[] = indexStr ? JSON.parse(indexStr) : [];
    if (!index.includes(state.googleSub)) {
      index.push(state.googleSub);
      localStorage.setItem(USER_INDEX_KEY, JSON.stringify(index));
    }
  }
}

export function loadZkLoginState(): ZkLoginState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ZkLoginState;
  } catch {
    return null;
  }
}

// Load existing user state by Google sub (for returning users)
export function loadUserByGoogleSub(sub: string): ZkLoginState | null {
  const userKey = `selora_zklogin_user_${sub}`;
  const raw = localStorage.getItem(userKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ZkLoginState;
  } catch {
    return null;
  }
}

export function clearZkLoginState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ----------------------------------------------------------------------------
// Generate random values
// ----------------------------------------------------------------------------

function generateRandomness(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return bytesToBase64(array);
}

function generateNonce(publicKey: string, epoch: number, randomness: string): string {
  const combined = `${publicKey}:${epoch}:${randomness}`;
  return btoa(combined).replace(/[+/=]/g, '').slice(0, 32);
}

// ----------------------------------------------------------------------------
// Initialization: create ephemeral keypair + nonce
// ----------------------------------------------------------------------------

export async function initZkLoginState(): Promise<ZkLoginState> {
  // Generate ephemeral keypair for this OAuth session
  const ephemeralKeyPair = new Ed25519Keypair();
  
  // Session validity: 7 days
  const maxEpoch = Date.now() + (7 * 24 * 60 * 60 * 1000);

  const randomness = generateRandomness();
  const publicKeyBase64 = bytesToBase64(ephemeralKeyPair.getPublicKey().toRawBytes());
  const nonce = generateNonce(publicKeyBase64, maxEpoch, randomness);

  // Get secret key
  const rawSecret = ephemeralKeyPair.getSecretKey();
  const secretKeyStr = typeof rawSecret === "string" 
    ? rawSecret 
    : bytesToBase64(rawSecret as unknown as Uint8Array);

  const state: ZkLoginState = {
    ephemeralKeyPair: {
      publicKey: publicKeyBase64,
      secretKey: secretKeyStr,
    },
    randomness,
    nonce,
    maxEpoch,
    salt: STATIC_SALT,
    createdAt: Date.now(),
  };

  saveZkLoginState(state);
  return state;
}

// ----------------------------------------------------------------------------
// Build Google OAuth URL (redirect approach)
// ----------------------------------------------------------------------------

export function buildGoogleOAuthUrl(nonce: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "id_token",
    response_mode: "fragment",
    scope: "openid email profile",
    nonce,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// ----------------------------------------------------------------------------
// Extract JWT id_token from the URL fragment
// ----------------------------------------------------------------------------

export function extractJwtFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash) return null;
  const params = new URLSearchParams(hash.slice(1));
  return params.get("id_token");
}

// ----------------------------------------------------------------------------
// Decode JWT
// ----------------------------------------------------------------------------

export function decodeJwt(jwt: string): JwtPayload {
  return jwtDecode<JwtPayload>(jwt);
}

// ----------------------------------------------------------------------------
// Derive IOTA address deterministically from Google identity
// The same Google account will ALWAYS get the same IOTA address
// ----------------------------------------------------------------------------

export async function deriveAddressFromGoogleSub(sub: string, salt: string): Promise<string> {
  // Create a deterministic seed from Google's unique sub claim and our salt
  const seed = `iota:${sub}:${salt}:address`;
  const hash = await sha256(seed);
  
  // Format as IOTA address (0x prefix + 64 hex chars)
  return `0x${hash}`;
}

// Generate a deterministic keypair for signing transactions
export async function deriveKeypairFromGoogleSub(sub: string, salt: string): Promise<Ed25519Keypair> {
  const seed = `iota:${sub}:${salt}:keypair`;
  const seedBytes = await deterministicSeedBytes(seed);
  return Ed25519Keypair.fromSecretKey(seedBytes);
}

// Generate a deterministic mnemonic/recovery phrase
export async function deriveMnemonicFromGoogleSub(sub: string, salt: string): Promise<string> {
  const seed = `iota:${sub}:${salt}:mnemonic`;
  const hash = await sha256(seed);
  
  // Convert hash to a simple word-based recovery phrase
  // In production, use proper BIP39 word list
  const words = [
    "apple", "brave", "coral", "delta", "eagle", "frost", "grace", "heart",
    "ivory", "jewel", "karma", "lunar", "maple", "noble", "ocean", "pearl",
    "quest", "river", "solar", "tiger", "unity", "vivid", "wave", "zenith"
  ];
  
  const phrase: string[] = [];
  for (let i = 0; i < 12; i++) {
    const index = parseInt(hash.slice(i * 5, i * 5 + 5), 16) % words.length;
    phrase.push(words[index]);
  }
  
  return phrase.join(" ");
}

// ----------------------------------------------------------------------------
// Process JWT after OAuth callback
// ----------------------------------------------------------------------------

export async function processJwtCallback(jwt: string): Promise<ZkLoginState> {
  const currentState = loadZkLoginState();
  if (!currentState) {
    throw new Error("No zkLogin state found. Please start the login process again.");
  }

  const decoded = decodeJwt(jwt);
  
  // Verify nonce matches
  if (decoded.nonce !== currentState.nonce) {
    throw new Error("Nonce mismatch. Please try logging in again.");
  }

  // Check if this is a returning user
  const existingUser = loadUserByGoogleSub(decoded.sub);
  
  // Derive deterministic IOTA address from Google sub
  const address = await deriveAddressFromGoogleSub(decoded.sub, STATIC_SALT);
  
  // Generate deterministic keypair for this user
  const keypair = await deriveKeypairFromGoogleSub(decoded.sub, STATIC_SALT);
  const publicKeyBase64 = bytesToBase64(keypair.getPublicKey().toRawBytes());
  const rawSecret = keypair.getSecretKey();
  const secretKeyStr = typeof rawSecret === "string" 
    ? rawSecret 
    : bytesToBase64(rawSecret as unknown as Uint8Array);

  const updatedState: ZkLoginState = {
    ...currentState,
    ephemeralKeyPair: {
      publicKey: publicKeyBase64,
      secretKey: secretKeyStr,
    },
    jwt,
    address,
    googleEmail: decoded.email,
    googleName: decoded.name,
    googleSub: decoded.sub,
  };

  saveZkLoginState(updatedState);
  
  // Log returning user status
  if (existingUser) {
    console.log("Welcome back! Restored session for:", decoded.email);
  } else {
    console.log("New user registered:", decoded.email);
  }

  return updatedState;
}

// ----------------------------------------------------------------------------
// High-level helpers
// ----------------------------------------------------------------------------

export function isZkLoginReady(state: ZkLoginState | null): boolean {
  return !!(state?.jwt && state?.address);
}

export function isZkLoginExpired(state: ZkLoginState | null): boolean {
  if (!state) return true;
  return Date.now() > state.maxEpoch;
}

// Get user info from stored state
export function getZkLoginUserInfo(state: ZkLoginState | null): { 
  email?: string; 
  name?: string; 
  address?: string;
  isReturningUser?: boolean;
} | null {
  if (!state || !isZkLoginReady(state)) return null;
  
  // Check if this is a returning user
  const isReturningUser = state.googleSub 
    ? !!loadUserByGoogleSub(state.googleSub) 
    : false;
  
  return {
    email: state.googleEmail,
    name: state.googleName,
    address: state.address,
    isReturningUser,
  };
}

// Get the recovery phrase for the user
export async function getRecoveryPhrase(state: ZkLoginState | null): Promise<string | null> {
  if (!state?.googleSub) return null;
  return deriveMnemonicFromGoogleSub(state.googleSub, STATIC_SALT);
}
