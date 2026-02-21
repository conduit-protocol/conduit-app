'use client';

import { useWallet }         from '@/contexts/WalletContext';
import { truncateAddress }   from '@/lib/format';
import { LogOut }            from 'lucide-react';

export function ConnectButton() {
  const { connected, connecting, publicKey, walletName, connect, disconnect } = useWallet();

  if (connecting) {
    return (
      <button disabled className="btn-secondary text-xs opacity-60">
        Connecting…
      </button>
    );
  }

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden sm:block text-xs text-gray-500 font-mono">
          {truncateAddress(publicKey)}
        </span>
        <button
          onClick={disconnect}
          className="btn-secondary text-xs"
          title={`Disconnect ${walletName}`}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <button onClick={connect} className="btn-secondary text-xs">
      Connect wallet
    </button>
  );
}
