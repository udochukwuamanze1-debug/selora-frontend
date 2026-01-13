import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, Key, Loader2, Download, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { importWalletFromMnemonic } from "@/lib/wallet-keyphrase";
import { toast } from "sonner";

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (address: string) => void;
}

type ModalView = "main" | "import";

export const WalletConnectModal = ({
  open,
  onOpenChange,
  onConnect,
}: WalletConnectModalProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [view, setView] = useState<ModalView>("main");
  const [importWords, setImportWords] = useState<string[]>(Array(12).fill(""));
  const [isImporting, setIsImporting] = useState(false);

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

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...importWords];
    // Handle paste of full mnemonic
    if (value.includes(" ") && index === 0) {
      const pastedWords = value.trim().toLowerCase().split(/\s+/);
      if (pastedWords.length === 12) {
        setImportWords(pastedWords);
        return;
      }
    }
    newWords[index] = value.toLowerCase().trim();
    setImportWords(newWords);
  };

  const handleImportWallet = async () => {
    const mnemonic = importWords.join(" ").trim();
    
    if (importWords.some(w => !w)) {
      toast.error("Please fill in all 12 words");
      return;
    }

    setIsImporting(true);
    
    try {
      const result = await importWalletFromMnemonic(mnemonic);
      
      if (result.success && result.walletAddress) {
        toast.success("Wallet imported successfully!");
        onConnect(result.walletAddress);
        onOpenChange(false);
        resetModal();
      } else {
        toast.error(result.error || "Failed to import wallet");
      }
    } catch (error) {
      toast.error("Failed to import wallet. Please check your recovery phrase.");
    } finally {
      setIsImporting(false);
    }
  };

  const resetModal = () => {
    setView("main");
    setImportWords(Array(12).fill(""));
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetModal();
    }
    onOpenChange(newOpen);
  };

  const filledWordsCount = importWords.filter(w => w.length > 0).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass-card border-selora-glass-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-center flex items-center justify-center gap-2">
            {view === "import" && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-4"
                onClick={() => setView("main")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {view === "main" ? "Connect to Selora" : "Import Wallet"}
          </DialogTitle>
        </DialogHeader>

        {view === "main" ? (
          <>
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
                  <div className="font-semibold">Create New Wallet</div>
                  <div className="text-xs text-muted-foreground">
                    Generate a new wallet with recovery phrase
                  </div>
                </div>
              </Button>

              <Button
                variant="glass"
                className="w-full h-16 justify-start gap-4 px-6"
                onClick={() => setView("import")}
                disabled={isConnecting}
              >
                <div className="p-2 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20">
                  <Download className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Import Existing Wallet</div>
                  <div className="text-xs text-muted-foreground">
                    Restore using 12-word recovery phrase
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
          </>
        ) : (
          <>
            <div className="py-4 space-y-4">
              <p className="text-center text-muted-foreground text-sm">
                Enter your 12-word recovery phrase to restore your wallet
              </p>

              <div className="grid grid-cols-3 gap-2">
                {importWords.map((word, index) => (
                  <div key={index} className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {index + 1}.
                    </span>
                    <Input
                      value={word}
                      onChange={(e) => handleWordChange(index, e.target.value)}
                      placeholder=""
                      className="pl-7 h-10 text-sm bg-background/50"
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span className="flex items-center gap-1">
                  {filledWordsCount === 12 && (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  )}
                  {filledWordsCount}/12 words entered
                </span>
                <span>Tip: Paste full phrase in first field</span>
              </div>

              <Button
                className="w-full mt-4"
                onClick={handleImportWallet}
                disabled={isImporting || filledWordsCount < 12}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Import Wallet
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your recovery phrase is encrypted locally and never leaves your device
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
