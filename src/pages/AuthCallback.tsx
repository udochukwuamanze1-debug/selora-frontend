import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loadZkLoginState,
  extractJwtFromUrl,
  processJwtCallback,
  getZkLoginUserInfo,
  loadUserByGoogleSub,
} from "@/lib/zklogin";
import { decodeJwt } from "@/lib/zklogin";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/**
 * OAuth callback page for zkLogin.
 * Handles the id_token fragment from Google and processes the login.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Authenticating...");

  useEffect(() => {
    const processCallback = async () => {
      try {
        const jwt = extractJwtFromUrl();
        if (!jwt) {
          console.error("No JWT found in callback URL");
          setStatus("error");
          setMessage("Authentication failed. Please try again.");
          setTimeout(() => navigate("/"), 2000);
          return;
        }

        const state = loadZkLoginState();
        if (!state) {
          console.error("No zkLogin session found");
          setStatus("error");
          setMessage("Session expired. Please try again.");
          setTimeout(() => navigate("/"), 2000);
          return;
        }

        setMessage("Verifying identity...");

        // Check if this is a returning user before processing
        const decoded = decodeJwt(jwt);
        const existingUser = loadUserByGoogleSub(decoded.sub);

        // Process JWT and derive IOTA address
        const finalState = await processJwtCallback(jwt);

        setStatus("success");
        
        if (existingUser) {
          setMessage(`Welcome back, ${finalState.googleName || decoded.email}!`);
          toast.success("Welcome back to Selora!");
        } else {
          setMessage(`Welcome, ${finalState.googleName || decoded.email}!`);
          toast.success("Account created successfully!");
        }
        
        // Store the zkLogin address so other parts of the app can use it
        sessionStorage.setItem("selora_zklogin_address", finalState.address || "");
        sessionStorage.setItem("selora_app_state", "portal-selection");

        // Navigate to portal selection after brief delay
        setTimeout(() => navigate("/"), 1500);
      } catch (e: any) {
        console.error("zkLogin callback error:", e);
        setStatus("error");
        setMessage("Login failed. Please try again.");
        toast.error("Login failed. Please try again.");
        setTimeout(() => navigate("/"), 2000);
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="glass-card p-8 text-center max-w-md">
        {status === "processing" && (
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        )}
        {status === "success" && (
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === "error" && (
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        <p className="text-lg font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
