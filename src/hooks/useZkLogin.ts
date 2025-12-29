import { useState, useEffect, useCallback } from "react";
import {
  ZkLoginState,
  loadZkLoginState,
  saveZkLoginState,
  clearZkLoginState,
  initZkLoginState,
  buildGoogleOAuthUrl,
  extractJwtFromUrl,
  fetchZkProof,
  isZkLoginReady,
} from "@/lib/zklogin";
import { toast } from "sonner";

/**
 * React hook to manage zkLogin flow state.
 */
export function useZkLogin() {
  const [state, setState] = useState<ZkLoginState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    const persisted = loadZkLoginState();
    if (persisted) {
      setState(persisted);
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
      toast.error("Failed to start zkLogin");
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
        // Update state with JWT
        const updatedState: ZkLoginState = { ...state, jwt };
        saveZkLoginState(updatedState);
        setState(updatedState);

        // Fetch ZK proof from prover
        const finalState = await fetchZkProof(updatedState);
        setState(finalState);
        toast.success("Logged in with zkLogin!");

        // Clean up URL fragment
        window.history.replaceState(null, "", window.location.pathname);
      } catch (e: any) {
        setError(e.message);
        toast.error("ZK proof failed: " + e.message);
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
    toast.info("Logged out");
  }, []);

  return {
    state,
    loading,
    error,
    isReady: isZkLoginReady(state),
    walletAddress: state?.address ?? null,
    startLogin,
    logout,
  };
}
