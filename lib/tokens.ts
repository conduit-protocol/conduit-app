/**
 * Known Stellar asset contracts for each network.
 *
 * Addresses here are testnet by default. Update for mainnet.
 * See: https://stellar.expert/explorer/testnet
 */

export interface TokenMeta {
  symbol:    string;
  name:      string;
  decimals:  number;
  /** Stellar asset contract address — undefined for native XLM */
  address?:  string;
  logoUrl?:  string;
}

export const TOKENS_TESTNET: TokenMeta[] = [
  {
    symbol:   'XLM',
    name:     'Stellar Lumens',
    decimals: 7,
    // Native XLM is accessed via the Stellar Asset Contract (SAC)
    address:  'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  },
  {
    symbol:   'USDC',
    name:     'USD Coin',
    decimals: 7,
    address:  'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA',
  },
  {
    symbol:   'EURC',
    name:     'Euro Coin',
    decimals: 7,
    address:  'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
  },
];

export const TOKENS_MAINNET: TokenMeta[] = [
  {
    symbol:   'XLM',
    name:     'Stellar Lumens',
    decimals: 7,
    address:  'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA',
  },
  {
    symbol:   'USDC',
    name:     'USD Coin',
    decimals: 7,
    address:  'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75',
  },
];

export function getTokens(network: 'mainnet' | 'testnet' | 'local'): TokenMeta[] {
  return network === 'mainnet' ? TOKENS_MAINNET : TOKENS_TESTNET;
}

export function tokenByAddress(address: string, network: 'mainnet' | 'testnet' | 'local'): TokenMeta | undefined {
  return getTokens(network).find(t => t.address === address);
}

export function tokenBySymbol(symbol: string, network: 'mainnet' | 'testnet' | 'local'): TokenMeta | undefined {
  return getTokens(network).find(t => t.symbol === symbol);
}
