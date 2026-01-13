import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wallet,
  Download,
  Key,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Shield,
  Copy,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  importWalletFromMnemonic, 
  generateAndStoreWalletMnemonic,
  getKeyphraseFromVault,
  hasKeyphraseInVault,
} from "@/lib/wallet-keyphrase";

interface WalletOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (address: string) => void;
  existingWalletAddress?: string | null;
}

type OnboardingStep = "welcome" | "choice" | "create" | "backup" | "import" | "existing" | "complete";

export const WalletOnboarding = ({
  open,
  onOpenChange,
  onConnect,
  existingWalletAddress,
}: WalletOnboardingProps) => {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [importWords, setImportWords] = useState<string[]>(Array(12).fill(""));
  const [generatedAddress, setGeneratedAddress] = useState<string>("");

  // Check for existing wallet on open
  useEffect(() => {
    if (open && existingWalletAddress && hasKeyphraseInVault(existingWalletAddress)) {
      setStep("existing");
    } else if (open) {
      setStep("welcome");
    }
  }, [open, existingWalletAddress]);

  const handleCreateWallet = async () => {
    setIsLoading(true);
    try {
      const { Ed25519Keypair } = await import("@iota/iota-sdk/keypairs/ed25519");
      const { generateMnemonic } = await import("@scure/bip39");
      const { wordlist } = await import("@scure/bip39/wordlists/english.js");
      
      const newMnemonic = generateMnemonic(wordlist, 128);
      const keypair = Ed25519Keypair.deriveKeypair(newMnemonic);
      const address = keypair.getPublicKey().toIotaAddress();
      
      setMnemonic(newMnemonic.split(" "));
      setGeneratedAddress(address);
      
      await generateAndStoreWalletMnemonic(address);
      
      setStep("backup");
    } catch (error) {
      toast.error("Failed to create wallet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic.join(" "));
    setCopied(true);
    toast.success("Recovery phrase copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackupComplete = () => {
    if (!backupConfirmed) {
      toast.error("Please confirm you've saved your recovery phrase");
      return;
    }
    setStep("complete");
  };

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...importWords];
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
    const mnemonicStr = importWords.join(" ").trim();
    
    if (importWords.some(w => !w)) {
      toast.error("Please fill in all 12 words");
      return;
    }

    setIsLoading(true);
    try {
      const result = await importWalletFromMnemonic(mnemonicStr);
      
      if (result.success && result.walletAddress) {
        setGeneratedAddress(result.walletAddress);
        setStep("complete");
      } else {
        toast.error(result.error || "Failed to import wallet");
      }
    } catch {
      toast.error("Failed to import wallet. Please check your recovery phrase.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessExisting = async () => {
    if (existingWalletAddress) {
      onConnect(existingWalletAddress);
      onOpenChange(false);
    }
  };

  const handleComplete = () => {
    onConnect(generatedAddress);
    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setStep("welcome");
    setMnemonic([]);
    setShowMnemonic(false);
    setCopied(false);
    setBackupConfirmed(false);
    setImportWords(Array(12).fill(""));
    setGeneratedAddress("");
  };

  const filledWordsCount = importWords.filter(w => w.length > 0).length;

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold">Welcome to Selora</h2>
              <p className="text-muted-foreground mt-2">
                Your secure health data wallet on IOTA
              </p>
            </div>
            <div className="space-y-3 text-left bg-muted/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">End-to-end encrypted</p>
                  <p className="text-xs text-muted-foreground">Your data never leaves your device unencrypted</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Self-custody wallet</p>
                  <p className="text-xs text-muted-foreground">Only you control your keys and data</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">12-word recovery phrase</p>
                  <p className="text-xs text-muted-foreground">Back up once, access anywhere</p>
                </div>
              </div>
            </div>
            <Button className="w-full" onClick={() => setStep("choice")}>
              Get Started
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case "existing":
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold">Welcome Back!</h2>
              <p className="text-muted-foreground mt-2">
                We found your existing wallet
              </p>
            </div>
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Your wallet address</p>
              <p className="font-mono text-sm break-all">{existingWalletAddress}</p>
            </div>
            <div className="space-y-3">
              <Button className="w-full" onClick={handleAccessExisting}>
                Access My Wallet
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setStep("choice")}>
                Use Different Wallet
              </Button>
            </div>
          </div>
        );

      case "choice":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-heading font-bold">Choose an Option</h2>
              <p className="text-muted-foreground mt-2">
                Create a new wallet or restore an existing one
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleCreateWallet}
                disabled={isLoading}
                className="w-full p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/50 hover:border-primary/50 transition-all text-left flex items-start gap-4"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary mt-1" />
                ) : (
                  <div className="p-2 rounded-xl bg-primary/20">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-semibold">Create New Wallet</p>
                  <p className="text-sm text-muted-foreground">
                    Generate a new wallet with a 12-word recovery phrase
                  </p>
                </div>
              </button>
              <button
                onClick={() => setStep("import")}
                disabled={isLoading}
                className="w-full p-4 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-border/50 hover:border-accent/50 transition-all text-left flex items-start gap-4"
              >
                <div className="p-2 rounded-xl bg-accent/20">
                  <Download className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Import Existing Wallet</p>
                  <p className="text-sm text-muted-foreground">
                    Restore using your 12-word recovery phrase
                  </p>
                </div>
              </button>
            </div>
            <Button variant="ghost" className="w-full" onClick={() => setStep("welcome")}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        );

      case "backup":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-heading font-bold">Save Your Recovery Phrase</h2>
              <p className="text-muted-foreground mt-2">
                Write these 12 words down and store them safely
              </p>
            </div>

            <div className="relative">
              <div
                className={cn(
                  "grid grid-cols-3 gap-2 p-4 rounded-xl bg-muted/30 border border-border/50",
                  !showMnemonic && "blur-sm select-none"
                )}
              >
                {mnemonic.map((word, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                    <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>
                    <span className="text-sm font-mono">{word}</span>
                  </div>
                ))}
              </div>
              {!showMnemonic && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button variant="outline" onClick={() => setShowMnemonic(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Reveal Words
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleCopyMnemonic}>
                {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowMnemonic(!showMnemonic)}>
                {showMnemonic ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showMnemonic ? "Hide" : "Show"}
              </Button>
            </div>

            <label className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 cursor-pointer">
              <input
                type="checkbox"
                checked={backupConfirmed}
                onChange={(e) => setBackupConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                I have saved my recovery phrase in a secure location. I understand that losing it means losing access to my wallet.
              </span>
            </label>

            <Button className="w-full" onClick={handleBackupComplete} disabled={!backupConfirmed}>
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case "import":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-heading font-bold">Import Wallet</h2>
              <p className="text-muted-foreground mt-2">
                Enter your 12-word recovery phrase
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {importWords.map((word, index) => (
                <div key={index} className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {index + 1}.
                  </span>
                  <Input
                    value={word}
                    onChange={(e) => handleWordChange(index, e.target.value)}
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
                {filledWordsCount === 12 && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                {filledWordsCount}/12 words
              </span>
              <span>Tip: Paste full phrase in first field</span>
            </div>

            <Button
              className="w-full"
              onClick={handleImportWallet}
              disabled={isLoading || filledWordsCount < 12}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  Import Wallet
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <Button variant="ghost" className="w-full" onClick={() => setStep("choice")}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        );

      case "complete":
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold">You're All Set!</h2>
              <p className="text-muted-foreground mt-2">
                Your wallet is ready to use
              </p>
            </div>
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Your wallet address</p>
              <p className="font-mono text-sm break-all">{generatedAddress}</p>
            </div>
            <Button className="w-full" onClick={handleComplete}>
              Enter Selora
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/50 max-w-md p-6">
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};
