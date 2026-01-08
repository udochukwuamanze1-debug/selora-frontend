import { useState, useEffect, useCallback } from "react";
import {
  ZkLoginState,
  loadZkLoginState,
  clearZkLoginState,
  initZkLoginState,
  buildGoogleOAuthUrl,
  extractJwtFromUrl,
  processJwtCallback,
  isZkLoginReady,
  isZkLoginExpired,
  getZkLoginUserInfo,
  getRecoveryPhrase,
} from "@/lib/zklogin";
import { toast } from "sonner";

/**
 * React hook to manage zkLogin flow state with session persistence.
 */
export function useZkLogin() {
  const [state, setState] = useState<ZkLoginState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = useState<string | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    const persisted = loadZkLoginState();
    if (persisted) {
      // Check if session is expired
      if (isZkLoginExpired(persisted)) {
        // Session expired, but we can restore from Google sub if user logs in again
        console.log("Session expired, user will need to re-authenticate");
      }
      setState(persisted);
      
      // Load recovery phrase
      if (persisted.googleSub) {
        getRecoveryPhrase(persisted).then(setRecoveryPhrase);
      }
    }
  }, []);

  // On mount, check if we're on the callback URL with a JWT fragment
  useEffect(() => {
    const jwt = extractJwtFromUrl();
    if (jwt && state && !state.jwt) {
      handleOAuthCallback(jwt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Start the zkLogin flow: init ephemeral keypair then redirect to Google
  const startLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newState = await initZkLoginState();
      setState(newState);
      const url = buildGoogleOAuthUrl(newState.nonce);
      window.location.href = url;
    } catch (e: any) {
      setError(e.message);
      toast.error("Failed to start login");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle the OAuth callback after redirect
  const handleOAuthCallback = useCallback(
    async (jwt: string) => {
      if (!state) return;
      setLoading(true);
      setError(null);

      try {
        // Process JWT and derive address
        const finalState = await processJwtCallback(jwt);
        setState(finalState);
        
        // Load recovery phrase
        if (finalState.googleSub) {
          const phrase = await getRecoveryPhrase(finalState);
          setRecoveryPhrase(phrase);
        }
        
        // Check if returning user
        const userInfo = getZkLoginUserInfo(finalState);
        setIsReturningUser(userInfo?.isReturningUser ?? false);
        
        if (userInfo?.isReturningUser) {
          toast.success(`Welcome back, ${finalState.googleName || "user"}!`);
        } else {
          toast.success("Account created successfully!");
        }

        // Clean up URL fragment
        window.history.replaceState(null, "", window.location.pathname);
      } catch (e: any) {
        setError(e.message);
        toast.error("Login failed: " + e.message);
      } finally {
        setLoading(false);
      }
    },
    [state]
  );

  // Logout / clear state
  const logout = useCallback(() => {
    clearZkLoginState();
    setState(null);
    setRecoveryPhrase(null);
    setIsReturningUser(false);
    toast.info("Logged out");
  }, []);

  return {
    state,
    loading,
    error,
    isReady: isZkLoginReady(state),
    isExpired: isZkLoginExpired(state),
    isReturningUser,
    walletAddress: state?.address ?? null,
    userEmail: state?.googleEmail ?? null,
    userName: state?.googleName ?? null,
    recoveryPhrase,
    startLogin,
    logout,
  };
}
