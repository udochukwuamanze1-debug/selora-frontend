/**
 * zkLogin helper utilities for IOTA using Google OAuth.
 * Note: IOTA does not yet have native zkLogin support like Sui.
 * This module provides a simplified authentication flow that stores
 * user identity locally and generates deterministic addresses.
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

// Static salt for address derivation (in production, use a salt service)
const STATIC_SALT = "129390038577185583942388216820280642146";

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

// Simple hash function for deterministic address generation
async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ----------------------------------------------------------------------------
// Storage helpers
// ----------------------------------------------------------------------------

const STORAGE_KEY = "selora_zklogin_state";

export function saveZkLoginState(state: ZkLoginState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  // Create a simple nonce from the components
  const combined = `${publicKey}:${epoch}:${randomness}`;
  return btoa(combined).replace(/[+/=]/g, '').slice(0, 32);
}

// ----------------------------------------------------------------------------
// Initialization: create ephemeral keypair + nonce
// ----------------------------------------------------------------------------

export async function initZkLoginState(): Promise<ZkLoginState> {
  // Generate ephemeral keypair for this session
  const ephemeralKeyPair = new Ed25519Keypair();
  
  // Get current epoch (approximate, used for session validity)
  let maxEpoch = Date.now() + (2 * 24 * 60 * 60 * 1000); // 2 days validity

  // Generate randomness and nonce
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
// Derive IOTA address from JWT (deterministic based on Google sub + salt)
// ----------------------------------------------------------------------------

export async function deriveAddressFromJwt(jwt: string, salt: string): Promise<string> {
  const decoded = decodeJwt(jwt);
  // Create a deterministic seed from Google's sub claim and our salt
  const seed = `${decoded.sub}:${salt}:iota`;
  const hash = await sha256(seed);
  
  // Format as IOTA address (0x prefix + 64 hex chars)
  return `0x${hash}`;
}

// ----------------------------------------------------------------------------
// Process JWT after OAuth callback
// ----------------------------------------------------------------------------

export async function processJwtCallback(jwt: string): Promise<ZkLoginState> {
  const state = loadZkLoginState();
  if (!state) {
    throw new Error("No zkLogin state found. Please start the login process again.");
  }

  const decoded = decodeJwt(jwt);
  
  // Verify nonce matches
  if (decoded.nonce !== state.nonce) {
    throw new Error("Nonce mismatch. Please try logging in again.");
  }

  // Derive deterministic IOTA address
  const address = await deriveAddressFromJwt(jwt, state.salt);

  const updatedState: ZkLoginState = {
    ...state,
    jwt,
    address,
    googleEmail: decoded.email,
    googleName: decoded.name,
  };

  saveZkLoginState(updatedState);
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
  // Check if maxEpoch (timestamp) has passed
  return Date.now() > state.maxEpoch;
}

// Get user info from stored state
export function getZkLoginUserInfo(state: ZkLoginState | null): { email?: string; name?: string } | null {
  if (!state || !isZkLoginReady(state)) return null;
  return {
    email: state.googleEmail,
    name: state.googleName,
  };
}