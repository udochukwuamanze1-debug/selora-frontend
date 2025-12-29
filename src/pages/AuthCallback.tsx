import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  loadZkLoginState,
  extractJwtFromUrl,
  fetchZkProof,
  saveZkLoginState,
  ZkLoginState,
} from "@/lib/zklogin";
import { toast } from "sonner";

/**
 * OAuth callback page for zkLogin.
 * Handles the id_token fragment from Google and fetches the ZK proof.
 * This page is intentionally minimal - processing happens silently.
 */
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const jwt = extractJwtFromUrl();
        if (!jwt) {
          console.error("No JWT found in callback URL");
          navigate("/");
          return;
        }

        const state = loadZkLoginState();
        if (!state) {
          console.error("No zkLogin session found");
          navigate("/");
          return;
        }

        // Update state with JWT
        const updatedState: ZkLoginState = { ...state, jwt };
        saveZkLoginState(updatedState);

        // Fetch ZK proof silently
        const finalState = await fetchZkProof(updatedState);

        toast.success("Welcome to Selora!");
        
        // Store the zkLogin address so other parts of the app can use it
        sessionStorage.setItem("selora_zklogin_address", finalState.address || "");
        sessionStorage.setItem("selora_app_state", "portal-selection");

        // Navigate to portal selection
        navigate("/");
      } catch (e: any) {
        console.error("zkLogin callback error:", e);
        toast.error("Login failed. Please try again.");
        navigate("/");
      }
    };

    processCallback();
  }, [navigate]);

  // Minimal loading state - just a blank background
  return (
    <div className="min-h-screen bg-background" />
  );
};

export default AuthCallback;
