import { cn } from "@/lib/utils";

interface WalletAddressProps {
  address: string;
  className?: string;
}

export const WalletAddress = ({ address, className }: WalletAddressProps) => {
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className={cn(
      "px-3 py-1.5 rounded-lg bg-background text-foreground text-sm font-mono border border-border/50",
      className
    )}>
      {truncatedAddress}
    </div>
  );
};
