// Selora Smart Contract Configuration - Deployed on IOTA
export const SELORA_CONFIG = {
  // Main package ID - will be updated after IOTA contract deployment
  PACKAGE_ID: '0x0000000000000000000000000000000000000000000000000000000000000000',
  // Registry object for storing platform state
  REGISTRY_ID: '0x0000000000000000000000000000000000000000000000000000000000000000',
  // Upgrade capability (for future upgrades)
  UPGRADE_CAP: '0x0000000000000000000000000000000000000000000000000000000000000000',
  // Network configuration
  NETWORK: 'testnet' as const,
  // Fee configuration (in basis points)
  PRESCRIPTION_FEE_BPS: 50, // 0.5%
  RESEARCH_COMMISSION_BPS: 100, // 1%
  // Basis points divisor
  BASIS_POINTS_DIVISOR: 10000,
} as const;

// Access duration constants (milliseconds)
export const ACCESS_DURATION_MS = {
  ONE_TIME: 3600000, // 1 hour
  ONE_HOUR: 3600000,
  TWO_HOURS: 7200000,
  TWENTY_FOUR_HOURS: 86400000,
  ONE_WEEK: 604800000,
  THIRTY_DAYS: 2592000000,
} as const;

// Doctor Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: { tier: 0, name: 'Free', monthlyCost: 0, maxPatients: 10 },
  PRO: { tier: 1, name: 'Pro', monthlyCost: 2, maxPatients: 100 }, // 2 IOTA
  ENTERPRISE: { tier: 2, name: 'Enterprise', monthlyCost: 10, maxPatients: Infinity }, // 10 IOTA
} as const;

// IPFS Storage Configuration (replacing Walrus)
export const IPFS_CONFIG = {
  // Default IPFS gateway
  GATEWAY_URL: 'https://ipfs.io/ipfs',
  // Pinata API credentials (set via environment/secrets)
  PINATA_API_KEY: undefined as string | undefined,
  PINATA_SECRET_KEY: undefined as string | undefined,
} as const;

// Legacy Walrus config - kept for migration purposes
export const WALRUS_CONFIG = {
  AGGREGATOR_URL: 'https://aggregator.walrus-testnet.walrus.space',
  PUBLISHER_URL: 'https://publisher.walrus-testnet.walrus.space',
  DEFAULT_EPOCHS: 5,
} as const;

// Supported Networks - IOTA
export const NETWORKS = {
  devnet: {
    name: 'IOTA Devnet',
    rpcUrl: 'https://api.devnet.iota.cafe',
    faucetUrl: 'https://faucet.devnet.iota.cafe',
  },
  testnet: {
    name: 'IOTA Testnet',
    rpcUrl: 'https://api.testnet.iota.cafe',
    faucetUrl: 'https://faucet.testnet.iota.cafe',
  },
  mainnet: {
    name: 'IOTA Mainnet',
    rpcUrl: 'https://api.mainnet.iota.cafe',
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
