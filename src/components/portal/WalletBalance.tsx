import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface WalletBalanceProps {
  className?: string;
}

export const WalletBalance = ({ className }: WalletBalanceProps) => {
  const suiClient = useSuiClient();
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
        const balanceResponse = await suiClient.getBalance({
          owner: currentAccount.address,
        });
        
        // Convert from MIST to SUI (1 SUI = 10^9 MIST)
        const suiBalance = Number(balanceResponse.totalBalance) / 1_000_000_000;
        setBalance(suiBalance.toFixed(2));
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setBalance("0.00");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [currentAccount?.address, suiClient]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium">
        {isLoading ? "..." : `${balance} SUI`}
      </div>
    </div>
  );
};
