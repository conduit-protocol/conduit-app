'use client';

/**
 * WalletContext — Stellar wallet connection state.
 *
 * Wraps @stellar/wallet-kit StellarWalletsKit.
 * The full wallet-kit integration is left as a TODO; this context provides
 * the shape that the rest of the app depends on.
 *
 * See: https://stellarwalletskit.dev
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface WalletState {
  /** Connected Stellar public key (G-address), or null if not connected */
  publicKey:   string | null;
  /** Human-readable wallet name, e.g. 'Freighter' */
  walletName:  string | null;
  /** True while connection is being established */
  connecting:  boolean;
  /** True if the wallet is connected */
  connected:   boolean;
  connect:     () => Promise<void>;
  disconnect:  () => void;
  /** Sign a base64-encoded XDR transaction and return the signed XDR */
  signTx:      (xdr: string) => Promise<string>;
}

// ── Context ──────────────────────────────────────────────────────────────────

const WalletContext = createContext<WalletState | null>(null);

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [publicKey,  setPublicKey]  = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Restore previous session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('conduit:wallet');
    if (stored) {
      try {
        const { key, name } = JSON.parse(stored) as { key: string; name: string };
        setPublicKey(key);
        setWalletName(name);
      } catch { /* ignore malformed */ }
    }
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      // TODO: instantiate StellarWalletsKit and open the modal
      //
      // import { StellarWalletsKit, WalletNetwork, FREIGHTER_ID } from '@stellar/wallet-kit';
      // const kit = new StellarWalletsKit({ network: WalletNetwork.TESTNET, selectedWalletId: FREIGHTER_ID });
      // await kit.openModal({ onWalletSelected: async (option) => {
      //   kit.setWallet(option.id);
      //   const { address } = await kit.getAddress();
      //   setPublicKey(address);
      //   setWalletName(option.name);
      //   localStorage.setItem('conduit:wallet', JSON.stringify({ key: address, name: option.name }));
      // }});

      // Stub for now — simulates a connected wallet
      const stub = 'GABC1234STUBWALLET000000000000000000000000000000000000';
      setPublicKey(stub);
      setWalletName('Freighter (stub)');
      localStorage.setItem('conduit:wallet', JSON.stringify({ key: stub, name: 'Freighter (stub)' }));
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setWalletName(null);
    localStorage.removeItem('conduit:wallet');
  }, []);

  const signTx = useCallback(async (xdr: string): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected');
    // TODO: kit.signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE })
    console.log('signTx (stub):', xdr.slice(0, 32) + '…');
    return xdr; // stub: return unsigned XDR
  }, [publicKey]);

  return (
    <WalletContext.Provider value={{
      publicKey,
      walletName,
      connecting,
      connected: publicKey !== null,
      connect,
      disconnect,
      signTx,
    }}>
      {children}
    </WalletContext.Provider>
  );
}
