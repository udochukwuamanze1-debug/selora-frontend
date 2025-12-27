// Selora Smart Contract Configuration
export const SELORA_CONFIG = {
  PACKAGE_ID: '0xfe040746bc4d147ec4a476d35e93e83fb7547aa39af5f2454b8c44187e3d8cfb',
  REGISTRY_ID: '0xbf7db925a98d1f573405292f477b60e06ab3d005551b2d9c02ef1c9613f888a0',
  NETWORK: 'devnet' as const,
} as const;

// Walrus Storage Configuration
export const WALRUS_CONFIG = {
  // Walrus aggregator endpoint for devnet
  AGGREGATOR_URL: 'https://aggregator.walrus-testnet.walrus.space',
  PUBLISHER_URL: 'https://publisher.walrus-testnet.walrus.space',
} as const;

// Supported Networks
export const NETWORKS = {
  devnet: {
    name: 'Sui Devnet',
    rpcUrl: 'https://fullnode.devnet.sui.io:443',
  },
  testnet: {
    name: 'Sui Testnet',
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
  },
  mainnet: {
    name: 'Sui Mainnet',
    rpcUrl: 'https://fullnode.mainnet.sui.io:443',
  },
} as const;
