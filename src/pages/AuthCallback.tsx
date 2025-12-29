import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loadZkLoginState,
  extractJwtFromUrl,
  fetchZkProof,
  saveZkLoginState,
  ZkLoginState,
} from "@/lib/zklogin";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * OAuth callback page for zkLogin.
 * Handles the id_token fragment from Google and fetches the ZK proof.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing login...");

  useEffect(() => {
    const processCallback = async () => {
      try {
        const jwt = extractJwtFromUrl();
        if (!jwt) {
          toast.error("No JWT found in callback URL");
          navigate("/");
          return;
        }

        const state = loadZkLoginState();
        if (!state) {
          toast.error("No zkLogin session found");
          navigate("/");
          return;
        }

        setStatus("Fetching ZK proof...");

        // Update state with JWT
        const updatedState: ZkLoginState = { ...state, jwt };
        saveZkLoginState(updatedState);

        // Fetch ZK proof
        const finalState = await fetchZkProof(updatedState);

        toast.success("zkLogin successful!");
        
        // Store the zkLogin address so other parts of the app can use it
        sessionStorage.setItem("selora_zklogin_address", finalState.address || "");
        sessionStorage.setItem("selora_app_state", "portal-selection");

        // Navigate to portal selection
        navigate("/");
      } catch (e: any) {
        console.error("zkLogin callback error:", e);
        toast.error("Login failed: " + e.message);
        navigate("/");
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="glass-card p-8 text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <p className="text-lg font-medium">{status}</p>
        <p className="text-sm text-muted-foreground">
          Please wait while we complete your login...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
