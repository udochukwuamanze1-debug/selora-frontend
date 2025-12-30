// Selora Smart Contract Configuration - Deployed on Devnet
export const SELORA_CONFIG = {
  // Main package ID - deployed contract
  PACKAGE_ID: '0xeae91c577a8aa720cdb2c0301136b6721fd42149cf7c6bc29d1d87922f83545c',
  // Registry object for storing platform state
  REGISTRY_ID: '0x516e6cbd4871ae3240b914d8205a5aa9c4cad5d4ed28b024156ed5f607355299',
  // Upgrade capability (for future upgrades)
  UPGRADE_CAP: '0x763e3c799f589f36a05c97333b194f22f0154ac2052aeb0282a946f1c1125d33',
  // Network configuration
  NETWORK: 'devnet' as const,
  // Fee configuration (in basis points)
  PRESCRIPTION_FEE_BPS: 50, // 0.5%
  RESEARCH_COMMISSION_BPS: 100, // 1%
} as const;

// Doctor Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: { tier: 0, name: 'Free', monthlyCost: 0, maxPatients: 10 },
  PRO: { tier: 1, name: 'Pro', monthlyCost: 2, maxPatients: 100 }, // 2 SUI
  ENTERPRISE: { tier: 2, name: 'Enterprise', monthlyCost: 10, maxPatients: Infinity }, // 10 SUI
} as const;

// Walrus Storage Configuration
export const WALRUS_CONFIG = {
  // Walrus aggregator endpoint for testnet
  AGGREGATOR_URL: 'https://aggregator.walrus-testnet.walrus.space',
  PUBLISHER_URL: 'https://publisher.walrus-testnet.walrus.space',
  // Default storage epochs (how long data persists)
  DEFAULT_EPOCHS: 5,
} as const;

// Supported Networks
export const NETWORKS = {
  devnet: {
    name: 'Sui Devnet',
    rpcUrl: 'https://fullnode.devnet.sui.io:443',
    faucetUrl: 'https://faucet.devnet.sui.io/gas',
  },
  testnet: {
    name: 'Sui Testnet',
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
    faucetUrl: 'https://faucet.testnet.sui.io/gas',
  },
  mainnet: {
    name: 'Sui Mainnet',
    rpcUrl: 'https://fullnode.mainnet.sui.io:443',
  },
} as const;

// Access Request Durations
export const ACCESS_DURATIONS = {
  ONE_TIME: 0, // Expires after single view
  ONE_HOUR: 60 * 60 * 1000,
  TWO_HOURS: 2 * 60 * 60 * 1000,
  TWENTY_FOUR_HOURS: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;
