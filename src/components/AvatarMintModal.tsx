import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2 } from "lucide-react";

interface AvatarMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMint: (name: string) => Promise<void>;
  isMinting: boolean;
}

export const AvatarMintModal = ({
  isOpen,
  onClose,
  onMint,
  isMinting,
}: AvatarMintModalProps) => {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onMint(name);
    setName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <div className="p-2 rounded-xl bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            Mint Your Selora Avatar
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Your Selora Avatar is a soulbound NFT that represents your identity on the platform. It enables consent management and coordination across all interactions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="avatarName">Avatar Name</Label>
            <Input
              id="avatarName"
              placeholder="Enter your avatar name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isMinting}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This name will be visible on-chain
            </p>
          </div>

          <div className="glass-card p-4 bg-muted/50">
            <h4 className="text-sm font-medium text-foreground mb-2">What you get:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• On-chain identity for consent</li>
              <li>• Access to all Selora features</li>
              <li>• Verifiable health data ownership</li>
              <li>• Reward eligibility</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isMinting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={!name.trim() || isMinting}
            >
              {isMinting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Minting...
                </>
              ) : (
                "Mint Avatar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
