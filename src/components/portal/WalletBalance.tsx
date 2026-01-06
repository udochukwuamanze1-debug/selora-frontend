import { useIotaClient, useCurrentAccount } from "@iota/dapp-kit";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface WalletBalanceProps {
  className?: string;
}

export const WalletBalance = ({ className }: WalletBalanceProps) => {
  const iotaClient = useIotaClient();
  const currentAccount = useCurrentAccount();
  const [balance, setBalance] = useState<string>("0.00");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!currentAccount?.address) {
        setBalance("0.00");
        setIsLoading(false);
        return;
      }

      try {
        const balanceResponse = await iotaClient.getBalance({
          owner: currentAccount.address,
        });
        
        // Convert from nanoIOTA to IOTA (1 IOTA = 10^9 nanoIOTA)
        const iotaBalance = Number(balanceResponse.totalBalance) / 1_000_000_000;
        setBalance(iotaBalance.toFixed(2));
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setBalance("0.00");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [currentAccount?.address, iotaClient]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium">
        {isLoading ? "..." : `${balance} IOTA`}
      </div>
    </div>
  );
};
