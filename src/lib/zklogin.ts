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
  const secretKey = Uint8Array.from(Buffer.from(state.ephemeralKeyPair.secretKey, "base64"));
  return Ed25519Keypair.fromSecretKey(secretKey.slice(0, 32));
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
  const extendedPublicKey = getExtendedEphemeralPublicKey(ephemeralKeyPair.getPublicKey());

  // Generate randomness and nonce
  const randomness = generateRandomness();
  const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);

  const state: ZkLoginState = {
    ephemeralKeyPair: {
      publicKey: Buffer.from(ephemeralKeyPair.getPublicKey().toRawBytes()).toString("base64"),
      secretKey: Buffer.from(ephemeralKeyPair.getSecretKey()).toString("base64"),
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
    scope: "openid email profile",
    nonce,
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

  const decoded = decodeJwt(state.jwt);
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
    Array.isArray(decoded.aud) ? decoded.aud[0] : decoded.aud
  ).toString();

  return getZkLoginSignature({
    inputs: {
      ...state.proof,
      addressSeed,
    },
    maxEpoch: state.maxEpoch,
    userSignature: Buffer.from(userSignature).toString("base64"),
  });
}

// ----------------------------------------------------------------------------
// High-level hook helpers
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
