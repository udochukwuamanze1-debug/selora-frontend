/**
 * zkLogin helper utilities for Sui using Google OAuth (devnet).
 * Implements ephemeral keypair generation, nonce generation, and ZK proof fetching.
 */
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import {
  generateNonce,
  generateRandomness,
  getExtendedEphemeralPublicKey,
  jwtToAddress,
  genAddressSeed,
  getZkLoginSignature,
} from "@mysten/sui/zklogin";
import { jwtDecode } from "jwt-decode";

// ----------------------------------------------------------------------------
// Configuration for Devnet
// ----------------------------------------------------------------------------

export const GOOGLE_CLIENT_ID =
  "391574072796-i6ban2nd2fumh1imjmhljl6bpek7himc.apps.googleusercontent.com";

const REDIRECT_URI =
  typeof window !== "undefined"
    ? `${window.location.origin}/auth/callback`
    : "https://tryselora.vercel.app/auth/callback";

// Sui devnet prover endpoint (used by Mysten for devnet ZK proof generation)
const PROVER_URL = "https://prover-dev.mystenlabs.com/v1";

// Salt service URL (For simplicity we use a static user salt stored locally.
// In production you would call a salt service or store encrypted salts.)
const STATIC_SALT = "129390038577185583942388216820280642146";

// The SuiClient for fetching epoch information
const suiClient = new SuiClient({ url: getFullnodeUrl("devnet") });

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
  proof?: ZkProof;
  address?: string;
  salt: string;
}

interface ZkProof {
  proofPoints: {
    a: string[];
    b: string[][];
    c: string[];
  };
  issBase64Details: {
    value: string;
    indexMod4: number;
  };
  headerBase64: string;
}

interface JwtPayload {
  iss: string;
  aud: string;
  sub: string;
  nonce: string;
  exp: number;
  iat: number;
}

// ----------------------------------------------------------------------------
// Base64 helpers (avoid Node Buffer - fixes iOS/Android browser incompat)
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
// Ephemeral keypair helpers
// ----------------------------------------------------------------------------

function keypairFromState(state: ZkLoginState): Ed25519Keypair {
  const stored = state.ephemeralKeyPair.secretKey;
  
  // Handle bech32-encoded secret key (suiprivkey1...)
  if (stored.startsWith("suiprivkey")) {
    return Ed25519Keypair.fromSecretKey(stored);
  }
  
  // Handle base64-encoded raw bytes
  const secretKeyBytes = base64ToBytes(stored);
  // fromSecretKey expects 32-byte seed
  return Ed25519Keypair.fromSecretKey(secretKeyBytes.slice(0, 32));
}

// ----------------------------------------------------------------------------
// Initialization: create ephemeral keypair + nonce
// ----------------------------------------------------------------------------

export async function initZkLoginState(): Promise<ZkLoginState> {
  // Fetch current epoch from devnet
  const { epoch } = await suiClient.getLatestSuiSystemState();
  const maxEpoch = Number(epoch) + 2; // valid for 2 epochs

  // Generate ephemeral keypair
  const ephemeralKeyPair = new Ed25519Keypair();

  // Generate randomness and nonce
  const randomness = generateRandomness();
  const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);

  // Get secret key - may be string (bech32) or Uint8Array depending on version
  const rawSecret = ephemeralKeyPair.getSecretKey();
  const secretKeyStr = typeof rawSecret === "string" 
    ? rawSecret 
    : bytesToBase64(rawSecret as unknown as Uint8Array);

  const state: ZkLoginState = {
    ephemeralKeyPair: {
      publicKey: bytesToBase64(ephemeralKeyPair.getPublicKey().toRawBytes()),
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
// Derive Sui address from JWT using zkLogin address derivation
// ----------------------------------------------------------------------------

export function deriveAddressFromJwt(jwt: string, salt: string): string {
  return jwtToAddress(jwt, BigInt(salt));
}

// ----------------------------------------------------------------------------
// Fetch ZK proof from Mysten prover
// ----------------------------------------------------------------------------

export async function fetchZkProof(state: ZkLoginState): Promise<ZkLoginState> {
  if (!state.jwt) throw new Error("JWT not set");

  const ephemeralKeyPair = keypairFromState(state);
  const extendedPublicKey = getExtendedEphemeralPublicKey(ephemeralKeyPair.getPublicKey());

  const payload = {
    jwt: state.jwt,
    extendedEphemeralPublicKey: extendedPublicKey,
    maxEpoch: state.maxEpoch,
    jwtRandomness: state.randomness,
    salt: state.salt,
    keyClaimName: "sub",
  };

  const response = await fetch(PROVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Prover error: ${text}`);
  }

  const proof = await response.json();

  const address = deriveAddressFromJwt(state.jwt, state.salt);

  const updatedState: ZkLoginState = {
    ...state,
    proof,
    address,
  };

  saveZkLoginState(updatedState);
  return updatedState;
}

// ----------------------------------------------------------------------------
// Build zkLogin signature (for signing transactions)
// ----------------------------------------------------------------------------

export function buildZkLoginSignature(
  state: ZkLoginState,
  userSignature: Uint8Array
): string {
  if (!state.proof || !state.jwt) {
    throw new Error("Proof or JWT not available");
  }

  const decoded = decodeJwt(state.jwt);
  const addressSeed = genAddressSeed(
    BigInt(state.salt),
    "sub",
    decoded.sub,
    // jwtDecode type says aud is string, but some ID tokens can be array-like
    (decoded as any).aud && Array.isArray((decoded as any).aud)
      ? (decoded as any).aud[0]
      : (decoded as any).aud
  ).toString();

  const signatureInputs = {
    proofPoints: state.proof.proofPoints,
    issBase64Details: state.proof.issBase64Details,
    headerBase64: state.proof.headerBase64,
    addressSeed,
  };

  return getZkLoginSignature({
    inputs: signatureInputs,
    maxEpoch: state.maxEpoch,
    userSignature: bytesToBase64(userSignature),
  });
}

// ----------------------------------------------------------------------------
// High-level helpers
// ----------------------------------------------------------------------------

export function isZkLoginReady(state: ZkLoginState | null): boolean {
  return !!(state?.proof && state?.address);
}

export function isZkLoginExpired(state: ZkLoginState | null): boolean {
  if (!state) return true;
  // We cannot easily check current epoch from sync context, but
  // caller can check state.maxEpoch against current epoch.
  return false;
}

