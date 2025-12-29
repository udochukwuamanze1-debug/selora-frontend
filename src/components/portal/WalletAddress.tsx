import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WalletAddressProps {
  address: string;
  className?: string;
}

export const WalletAddress = ({ address, className }: WalletAddressProps) => {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setShowModal(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  return (
    <>
      <button
        onClick={handleCopy}
        className={cn(
          "group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background text-foreground text-sm font-mono border border-border/50 hover:border-primary/50 transition-colors cursor-pointer",
          className
        )}
      >
        <span>{truncatedAddress}</span>
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
        )}
      </button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-500">
              <Check className="w-5 h-5" />
              Wallet Address Copied
            </DialogTitle>
            <DialogDescription>
              Your wallet address has been copied to your clipboard.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm break-all">
            {address}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
