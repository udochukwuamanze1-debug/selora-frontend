import { createNetworkConfig, IotaClientProvider, WalletProvider } from '@iota/dapp-kit';
import { getFullnodeUrl } from '@iota/iota-sdk/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@iota/dapp-kit/dist/index.css';

// Create network configuration for IOTA
const { networkConfig } = createNetworkConfig({
  devnet: { url: getFullnodeUrl('devnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

const queryClient = new QueryClient();

interface IotaProviderProps {
  children: React.ReactNode;
}

export function IotaProvider({ children }: IotaProviderProps) {
  const disableAutoConnect =
    typeof window !== "undefined" &&
    window.sessionStorage.getItem("selora_disable_autoconnect") === "1";

  return (
    <QueryClientProvider client={queryClient}>
      <IotaClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect={!disableAutoConnect}>{children}</WalletProvider>
      </IotaClientProvider>
    </QueryClientProvider>
  );
}
