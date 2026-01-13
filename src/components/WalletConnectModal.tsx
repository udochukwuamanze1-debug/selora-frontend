import { WalletOnboarding } from "@/components/WalletOnboarding";

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (address: string) => void;
  existingWalletAddress?: string | null;
}

export const WalletConnectModal = ({
  open,
  onOpenChange,
  onConnect,
  existingWalletAddress,
}: WalletConnectModalProps) => {
  return (
    <WalletOnboarding
      open={open}
      onOpenChange={onOpenChange}
      onConnect={onConnect}
      existingWalletAddress={existingWalletAddress}
    />
  );
};
