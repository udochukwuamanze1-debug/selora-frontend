// Selora Smart Contract Configuration - Deployed on IOTA
export const SELORA_CONFIG = {
  // Main package ID - deployed on IOTA testnet
  PACKAGE_ID: '0x919ffb01408ace4aa4e47532699f2dd85bd1ee3d9692853835efd2c0ee302b29',
  // Registry object for storing platform state
  REGISTRY_ID: '0xbf9a5493d708cbea493c4ce99db082a2c7af9b77403f134b2bfb3528554e1ce1',
  // Upgrade capability (for future upgrades)
  UPGRADE_CAP: '0x01664fb1f4b6e0596ad4d5ebc7a6f30cf96a05f8af673b94fa3ba0be385d67cd',
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
  GATEWAY_URL: 'https://gateway.pinata.cloud/ipfs',
  // Pinata API credentials
  PINATA_API_KEY: 'fdec5420ab624cba93b5453344f60b8d',
  PINATA_SECRET_KEY: 'eXg1ErE7Y0M6ilynBIUI5EiYQjfYId38txGcxf/VlQkgLmIyUxzeAg',
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
