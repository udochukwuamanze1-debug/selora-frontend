import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2 } from "lucide-react";
import { ConnectModal } from "@mysten/dapp-kit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { initZkLoginState, buildGoogleOAuthUrl, loadZkLoginState, isZkLoginReady } from "@/lib/zklogin";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AuthModal = ({ open, onOpenChange, onSuccess }: AuthModalProps) => {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Detect if user is on mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Check if user is already logged in via zkLogin
  useEffect(() => {
    const state = loadZkLoginState();
    if (isZkLoginReady(state) && state?.address) {
      // Already logged in, redirect to portal selection
      sessionStorage.setItem("selora_zklogin_address", state.address);
      sessionStorage.setItem("selora_app_state", "portal-selection");
      onSuccess?.();
      onOpenChange(false);
    }
  }, [open, onSuccess, onOpenChange]);

  const handleGoogleAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      // Initialize zkLogin state (ephemeral keypair, nonce)
      const state = await initZkLoginState();
      
      // Build the Google OAuth URL and redirect
      const authUrl = buildGoogleOAuthUrl(state.nonce);
      
      toast.info("Redirecting to Google...");
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error: any) {
      console.error("zkLogin initialization failed:", error);
      toast.error("Failed to start zkLogin: " + error.message);
      setIsLoading(false);
    }
  }, []);

  const handleWalletConnect = () => {
    onOpenChange(false);
    setWalletModalOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-card border-border/50 max-w-md">
          <DialogHeader className="text-center">
            <DialogTitle className="font-heading text-2xl text-foreground">
              Welcome to Selora
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose how you'd like to get started
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            {/* Google Sign In - For Web3 Beginners */}
            <Button
              variant="outline"
              className="w-full h-14 gap-3 text-base justify-start px-6 hover:bg-muted/50"
              onClick={handleGoogleAuth}
              disabled={isLoading}
            >
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <div className="font-medium">
                  {isLoading ? "Signing you in..." : "Continue with Google"}
                </div>
              </div>
            </Button>

            {/* Wallet Connection - Disabled on mobile */}
            <Button
              variant="outline"
              className={cn(
                "w-full h-14 gap-3 text-base justify-start px-6 hover:bg-muted/50",
                isMobile && "opacity-50 cursor-not-allowed"
              )}
              onClick={isMobile ? undefined : handleWalletConnect}
              disabled={isLoading || isMobile}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">Connect Wallet</div>
                {isMobile && (
                  <div className="text-xs text-muted-foreground">Desktop only</div>
                )}
              </div>
            </Button>

            <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/50">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-primary hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConnectModal
        trigger={<></>}
        open={walletModalOpen}
        onOpenChange={(isOpen) => {
          setWalletModalOpen(isOpen);
          if (!isOpen && onSuccess) {
            onSuccess();
          }
        }}
      />
    </>
  );
};
