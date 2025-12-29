import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';

// Create network configuration
const { networkConfig } = createNetworkConfig({
  devnet: { url: getFullnodeUrl('devnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

const queryClient = new QueryClient();

interface SuiProviderProps {
  children: React.ReactNode;
}

export function SuiProvider({ children }: SuiProviderProps) {
  const disableAutoConnect =
    typeof window !== "undefined" &&
    window.sessionStorage.getItem("selora_disable_autoconnect") === "1";

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="devnet">
        <WalletProvider autoConnect={!disableAutoConnect}>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
