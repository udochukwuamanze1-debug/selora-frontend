import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Key, Loader2 } from "lucide-react";
import { useState } from "react";

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (address: string) => void;
}

export const WalletConnectModal = ({
  open,
  onOpenChange,
  onConnect,
}: WalletConnectModalProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async (type: "wallet" | "zklogin") => {
    setIsConnecting(true);
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Generate mock wallet address
    const mockAddress = "0x" + Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    onConnect(mockAddress);
    setIsConnecting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-selora-glass-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-center">
            Connect to Selora
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <p className="text-center text-muted-foreground text-sm mb-6">
            Choose how you'd like to connect
          </p>

          <Button
            variant="glass"
            className="w-full h-16 justify-start gap-4 px-6"
            onClick={() => handleConnect("wallet")}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="text-left">
              <div className="font-semibold">Sui Wallet</div>
              <div className="text-xs text-muted-foreground">
                Connect with Mysten Labs wallet
              </div>
            </div>
          </Button>

          <Button
            variant="glass"
            className="w-full h-16 justify-start gap-4 px-6"
            onClick={() => handleConnect("zklogin")}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="p-2 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20">
                <Key className="w-5 h-5 text-secondary" />
              </div>
            )}
            <div className="text-left">
              <div className="font-semibold">zkLogin</div>
              <div className="text-xs text-muted-foreground">
                Sign in with Google, Apple, or email
              </div>
            </div>
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/50">
          By connecting, you agree to our{" "}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
