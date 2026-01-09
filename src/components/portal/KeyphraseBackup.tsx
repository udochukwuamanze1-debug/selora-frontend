import { useState, useEffect } from "react";
import { Key, Copy, Check, Mail, Shield, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { toast } from "sonner";
import {
  getKeyphraseFromVault,
  hasKeyphraseInVault,
  markKeyphraseBackedUp,
  getKeyphraseBackupStatus,
  formatMnemonicForEmail,
  generateAndStoreWalletMnemonic,
} from "@/lib/wallet-keyphrase";

interface KeyphraseBackupProps {
  walletAddress: string;
}

export function KeyphraseBackup({ walletAddress }: KeyphraseBackupProps) {
  const [showModal, setShowModal] = useState(false);
  const [showKeyphrase, setShowKeyphrase] = useState(false);
  const [keyphrase, setKeyphrase] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [backupStatus, setBackupStatus] = useState({
    exists: false,
    backedUp: false,
    emailSent: false,
  });

  useEffect(() => {
    const initKeyphrase = async () => {
      // Check if keyphrase exists and get backup status
      const status = getKeyphraseBackupStatus(walletAddress);
      setBackupStatus(status);

      // If no keyphrase exists, generate one
      if (!status.exists) {
        const newMnemonic = await generateAndStoreWalletMnemonic(walletAddress);
        setKeyphrase(newMnemonic);
        setBackupStatus({ exists: true, backedUp: false, emailSent: false });
      }
    };
    
    initKeyphrase();
  }, [walletAddress]);

  const handleViewKeyphrase = async () => {
    if (!keyphrase) {
      const stored = await getKeyphraseFromVault(walletAddress);
      setKeyphrase(stored);
    }
    setShowModal(true);
  };

  const handleCopy = async () => {
    if (!keyphrase) return;
    
    try {
      await navigator.clipboard.writeText(keyphrase);
      setCopied(true);
      markKeyphraseBackedUp(walletAddress);
      setBackupStatus((prev) => ({ ...prev, backedUp: true }));
      toast.success("Recovery phrase copied!", {
        description: "Store this in a safe place.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleEmailBackup = () => {
    if (!keyphrase) return;

    const formatted = formatMnemonicForEmail(keyphrase);
    const subject = encodeURIComponent("Selora Wallet Recovery Phrase - KEEP SECURE");
    const body = encodeURIComponent(`
⚠️ IMPORTANT: This is your Selora wallet recovery phrase.
Keep this email secure and never share it with anyone.

Your Wallet Address: ${walletAddress}

Recovery Phrase:
${formatted}

---
This phrase gives full access to your wallet.
Delete this email after saving it somewhere secure.

- Selora Health Platform
    `);

    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    
    toast.info("Email client opened", {
      description: "Send yourself the recovery phrase email.",
    });
  };

  return (
    <>
      {/* Backup Status Card */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Recovery Phrase</h3>
              <p className="text-xs text-muted-foreground">
                {backupStatus.backedUp
                  ? "Backed up securely"
                  : "Not backed up yet - action required"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={backupStatus.backedUp ? "default" : "destructive"}>
              {backupStatus.backedUp ? "Backed Up" : "Backup Needed"}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleViewKeyphrase}>
              View
            </Button>
          </div>
        </div>
      </div>

      {/* Keyphrase Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Your Recovery Phrase
            </DialogTitle>
            <DialogDescription>
              This 12-word phrase is the only way to recover your wallet
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Never share this phrase. Anyone with these words can access your wallet.
            </AlertDescription>
          </Alert>

          {/* Keyphrase Display */}
          <div className="relative">
            <div
              className={`grid grid-cols-3 gap-2 p-4 rounded-xl bg-muted/50 border ${
                showKeyphrase ? "" : "blur-sm select-none"
              }`}
            >
              {(keyphrase || "... ".repeat(12).trim())
                .split(" ")
                .map((word, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg bg-background"
                  >
                    <span className="text-xs text-muted-foreground w-5">
                      {i + 1}.
                    </span>
                    <span className="font-mono text-sm">{word}</span>
                  </div>
                ))}
            </div>

            {!showKeyphrase && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="secondary"
                  onClick={() => setShowKeyphrase(true)}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Reveal Phrase
                </Button>
              </div>
            )}
          </div>

          {showKeyphrase && (
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyphrase(false)}
                className="gap-1 text-xs"
              >
                <EyeOff className="w-3 h-3" />
                Hide
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleCopy}
              disabled={!showKeyphrase}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleEmailBackup}
              disabled={!showKeyphrase}
            >
              <Mail className="w-4 h-4" />
              Email to Self
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Store this phrase offline in a secure location. Consider writing it
            down on paper.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
