import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Chrome, Smartphone } from "lucide-react";
import { ConnectModal } from "@mysten/dapp-kit";
import { toast } from "sonner";

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

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    // This would integrate with zkLogin for Google auth
    // For now, show a toast explaining the feature
    toast.info("Google sign-in with zkLogin coming soon! This will create a Sui wallet linked to your Google account.");
    setIsLoading(false);
  };

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
                <Chrome className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">Continue with Google</div>
                <div className="text-xs text-muted-foreground">Easiest for beginners</div>
              </div>
            </Button>

            {/* Wallet Connection */}
            <Button
              variant="outline"
              className="w-full h-14 gap-3 text-base justify-start px-6 hover:bg-muted/50"
              onClick={handleWalletConnect}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {isMobile ? (
                  <Smartphone className="w-5 h-5 text-primary" />
                ) : (
                  <Wallet className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="text-left">
                <div className="font-medium">
                  {isMobile ? "Connect Mobile Wallet" : "Connect Wallet"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isMobile ? "Sui Wallet, Suiet, etc." : "Browser extension"}
                </div>
              </div>
            </Button>

            <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/50">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-primary hover:underline">Terms</a>
              {" "}and{" "}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
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
