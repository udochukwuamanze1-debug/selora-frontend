# Google zkLogin Setup Guide for Selora

This guide walks you through configuring **Google OAuth** and a **ZK prover** so that users can sign in with their Google account and receive a Sui-based wallet address derived from their identity.

---

## Prerequisites

1. A Google Cloud project (create at https://console.cloud.google.com).
2. Access to a ZK prover endpoint (Mysten Labs hosts a public testnet prover, or you can run your own).
3. Your deployed Selora app URL (e.g., `https://yourdomain.app`).

---

## Step 1 – Create Google OAuth Credentials

1. Go to **APIs & Services → Credentials** in your Google Cloud Console.
2. Click **Create Credentials → OAuth client ID**.
3. Choose **Web application**.
4. Under **Authorized JavaScript origins**, add:
   - `https://yourdomain.app`
   - `http://localhost:5173` (for local dev)
5. Under **Authorized redirect URIs**, add:
   - `https://yourdomain.app/auth/callback` (or whatever callback route you implement)
6. Copy the **Client ID** — you'll need it in your frontend code.

---

## Step 2 – Configure OAuth Consent Screen

1. Go to **OAuth consent screen** and configure branding (app name, logo, support email).
2. Add the following scopes:
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
3. Add your Selora domain to **Authorized domains**.
4. Publish to production when ready (otherwise only test users can sign in).

---

## Step 3 – Client-Side Flow (high-level)

```typescript
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { generateNonce, generateRandomness, jwtToAddress } from "@mysten/zklogin";

// 1. Generate ephemeral keypair & nonce
const ephemeralKeypair = new Ed25519Keypair();
const maxEpoch = currentEpoch + 2; // e.g., fetch from fullnode
const randomness = generateRandomness();
const nonce = generateNonce(ephemeralKeypair.getPublicKey(), maxEpoch, randomness);

// 2. Redirect to Google OAuth
const params = new URLSearchParams({
  client_id: GOOGLE_CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  response_type: "id_token",
  scope: "openid email profile",
  nonce,
});
window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

// 3. On callback, extract id_token from URL hash
const idToken = new URLSearchParams(window.location.hash.slice(1)).get("id_token");

// 4. Derive Sui address from JWT
const userSalt = await fetchOrCreateSalt(idToken); // Store per-user salt securely
const address = jwtToAddress(idToken, userSalt);

// 5. Fetch ZK proof from prover
const proofResponse = await fetch(ZK_PROVER_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jwt: idToken,
    extendedEphemeralPublicKey: ephemeralKeypair.getPublicKey().toBase64(),
    maxEpoch,
    jwtRandomness: randomness,
    salt: userSalt,
    keyClaimName: "sub",
  }),
});
const { zkProof } = await proofResponse.json();

// 6. Create zkLogin signature when signing transactions
// Combine zkProof with ephemeralKeypair signature
```

---

## Step 4 – Salt Storage

Each user needs a unique, persistent **salt** to derive the same address every time.

Options:
- Store in your backend (associate with Google `sub` claim).
- Encrypt and store on-chain via a guardian contract.
- Use a deterministic derivation from a secret seed + user identifier (advanced).

---

## Step 5 – ZK Prover Endpoints

| Network | Prover URL |
|---------|------------|
| Testnet | `https://prover-dev.mystenlabs.com/v1` |
| Mainnet | `https://prover.mystenlabs.com/v1` |

(Check Mysten Labs documentation for the latest URLs.)

---

## Step 6 – Testing

1. Run Selora locally (`npm run dev`).
2. Click **Continue with Google** → Sign in with a test account.
3. Verify the derived address is consistent across sessions.

---

## Troubleshooting

- **"requested path is invalid"** — Ensure Site URL and Redirect URL match exactly.
- **Proof generation fails** — Check that `maxEpoch` is within the allowed range.
- **Address changes each time** — Confirm the same salt is used.

---

## Resources

- Sui zkLogin docs: https://docs.sui.io/build/zk-login
- Mysten Labs zkLogin SDK: https://sdk.mystenlabs.com/zklogin
- Google OAuth playground: https://developers.google.com/oauthplayground
