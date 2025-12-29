# Complete Google zkLogin Setup Guide for Selora

This step-by-step guide is written for beginners (no coding experience needed). Follow each step carefully.

---

## Part 1: Create a Google Cloud Account (if you don't have one)

1. Go to https://console.cloud.google.com
2. Sign in with your Google account (or create one)
3. Accept the Terms of Service if prompted

---

## Part 2: Create a Google Cloud Project

1. In the top bar, click the project dropdown (it might say "Select a project")
2. Click **"New Project"**
3. Enter a name like `Selora zkLogin`
4. Click **"Create"**
5. Wait for it to create, then select it from the dropdown

---

## Part 3: Set Up OAuth Consent Screen

This tells Google what your app is and what permissions it needs.

1. In the left sidebar, click **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (allows any Google user to sign in) → Click **"Create"**
3. Fill in the form:

   | Field | What to Enter |
   |-------|---------------|
   | **App name** | `Selora` |
   | **User support email** | Your email address |
   | **App logo** | (Optional) Upload your logo |
   | **App domain** | Skip for now |
   | **Authorized domains** | Click **"Add Domain"** → Enter `tryselora.vercel.app` |
   | **Developer contact email** | Your email address |

4. Click **"Save and Continue"**

### Scopes Page
5. Click **"Add or Remove Scopes"**
6. Check these three scopes:
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
7. Click **"Update"** → **"Save and Continue"**

### Test Users Page
8. While in "Testing" mode, add yourself:
   - Click **"Add Users"**
   - Enter your Gmail address
   - Click **"Add"**
9. Click **"Save and Continue"** → **"Back to Dashboard"**

### Publish the App (when ready for production)
10. On the OAuth consent screen, click **"Publish App"** to allow anyone to sign in
    - ⚠️ Only do this when you're ready to go live

---

## Part 4: Create OAuth Credentials

1. In the left sidebar, click **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Choose **"Web application"**
4. Enter a name like `Selora Web Client`

### Authorized JavaScript Origins
Add these URLs (click **"+ Add URI"** for each):
```
https://tryselora.vercel.app
http://localhost:5173
```

### Authorized Redirect URIs
Add these URLs (click **"+ Add URI"** for each):
```
https://tryselora.vercel.app
https://tryselora.vercel.app/auth/callback
http://localhost:5173
http://localhost:5173/auth/callback
```

5. Click **"Create"**
6. **IMPORTANT**: Copy and save your **Client ID** - it looks like:
   ```
   123456789-abcdefg.apps.googleusercontent.com
   ```

---

## Part 5: Understanding Salt Storage

**What is a salt?** A salt is a random string that helps create your unique wallet address.

### Option A: Browser Storage (Simplest)
- The salt is stored in your browser's localStorage
- Pros: No setup needed, works immediately
- Cons: If you clear browser data or use a different browser, you'll get a different wallet address

### Option B: Backend Database Storage (Recommended for Production)
- Store salt associated with user's Google `sub` (unique ID) in a database
- Pros: Same wallet address across all devices/browsers
- Cons: Requires backend setup

### Current Implementation
Selora uses **browser localStorage** by default. The salt is generated once and saved as:
```
selora_user_salt_{google_sub_id}
```

---

## Part 6: ZK Prover Endpoints

The ZK prover generates cryptographic proofs for your login.

| Network | Prover URL |
|---------|------------|
| **Testnet** (for development) | `https://prover-dev.mystenlabs.com/v1` |
| **Mainnet** (for production) | `https://prover.mystenlabs.com/v1` |

You don't need to set these up - they're public services provided by Mysten Labs.

---

## Part 7: How the Login Flow Works (Layman's Explanation)

Here's what happens when a user clicks "Continue with Google":

### Step 1: Generate Keys
- A temporary key pair is created in your browser
- A random "nonce" is generated for security

### Step 2: Redirect to Google
- You're sent to Google's login page
- The URL includes your app's Client ID and the nonce

### Step 3: User Signs In
- You log in with your Google account
- Google verifies who you are

### Step 4: Get Token
- Google sends back an "ID token" (a coded string with your info)
- This token is extracted from the URL

### Step 5: Create Wallet Address
- Your unique salt is retrieved (or generated if new)
- Combined with the token, this creates your Sui wallet address
- Same Google account + same salt = same wallet address every time

### Step 6: Generate ZK Proof
- The ZK prover creates a cryptographic proof
- This proves you own the Google account without revealing personal info

### Step 7: Ready to Use
- You're now logged in with your Sui wallet
- You can sign transactions using your Google identity

---

## Part 8: Adding Your Client ID to Selora

Once you have your Google Client ID, you'll need to add it to the app:

1. Create a secret named `GOOGLE_CLIENT_ID` with your Client ID value
2. The redirect URI is: `https://tryselora.vercel.app/auth/callback`

---

## Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure the redirect URI in your Google Console exactly matches: `https://tryselora.vercel.app`
- Check there are no trailing slashes or typos

### "App not verified" Warning
- This shows when your app is in "Testing" mode
- Click "Advanced" → "Go to Selora (unsafe)" to continue
- This warning disappears after you publish your app

### "Proof generation failed"
- Check that maxEpoch is within the allowed range
- Try refreshing and logging in again

### "Address changes each time"
- This means the salt is changing
- Check if localStorage is being cleared
- Consider implementing backend salt storage

---

## Testing Your Setup

1. Run Selora locally with `npm run dev`
2. Click "Continue with Google"
3. Sign in with the test account you added
4. Verify you receive a wallet address
5. Log out and log back in - verify you get the SAME address

---

## Security Best Practices

1. **Never share your Google Client Secret** (if you have one)
2. **Keep your salt private** - anyone with your salt + Google token could derive your address
3. **Use HTTPS** - always use `https://` for production redirect URIs
4. **Verify tokens server-side** for sensitive operations

---

## Quick Reference

| Item | Value |
|------|-------|
| Your Website | `https://tryselora.vercel.app` |
| Redirect URI | `https://tryselora.vercel.app/auth/callback` |
| Local Dev URL | `http://localhost:5173` |
| Testnet Prover | `https://prover-dev.mystenlabs.com/v1` |
| Mainnet Prover | `https://prover.mystenlabs.com/v1` |

---

## Resources

- [Sui zkLogin Documentation](https://docs.sui.io/build/zk-login)
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [Mysten Labs zkLogin SDK](https://sdk.mystenlabs.com/zklogin)
