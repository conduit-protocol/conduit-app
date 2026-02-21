import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Required for @stellar/stellar-sdk in Edge / Node environments
  serverExternalPackages: ['@stellar/stellar-sdk'],

  // Expose only public vars to the browser
  env: {
    NEXT_PUBLIC_SOROBAN_RPC_URL:      process.env.NEXT_PUBLIC_SOROBAN_RPC_URL      ?? '',
    NEXT_PUBLIC_NETWORK_PASSPHRASE:   process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE   ?? '',
    NEXT_PUBLIC_FACTORY_CONTRACT_ID:  process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID  ?? '',
    NEXT_PUBLIC_GOVERNOR_CONTRACT_ID: process.env.NEXT_PUBLIC_GOVERNOR_CONTRACT_ID ?? '',
    NEXT_PUBLIC_HORIZON_URL:          process.env.NEXT_PUBLIC_HORIZON_URL          ?? '',
  },
};

export default nextConfig;
