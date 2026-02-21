'use client';

import { useState }             from 'react';
import { ArrowDownToLine, CheckCircle, AlertCircle } from 'lucide-react';
import { fromStroops }          from '@/lib/format';

type Step = 'idle' | 'signing' | 'submitting' | 'done' | 'error';

interface WithdrawButtonProps {
  streamId:    string;
  withdrawable: bigint;
  token:       string;
  onSuccess?:  () => void;
}

export function WithdrawButton({ streamId, withdrawable, token, onSuccess }: WithdrawButtonProps) {
  const [step, setStep]     = useState<Step>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError]   = useState<string | null>(null);

  const amount = fromStroops(withdrawable);
  const isEmpty = withdrawable === 0n;

  async function handleWithdraw() {
    setStep('signing');
    setError(null);
    try {
      // TODO: call conduit SDK
      // const hash = await conduit.streams.withdraw(streamId, withdrawable);
      setStep('submitting');
      await new Promise(r => setTimeout(r, 1200)); // simulate tx time
      setTxHash('TXHASH_PLACEHOLDER');
      setStep('done');
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed');
      setStep('error');
    }
  }

  if (step === 'done') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded text-sm">
        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
        <span>
          <strong>Withdrawn {amount} {token}</strong>
          {txHash && (
            <span className="text-gray-400 font-mono text-xs ml-2">{txHash.slice(0, 12)}…</span>
          )}
        </span>
        <button onClick={() => setStep('idle')} className="ml-auto text-xs text-gray-400 hover:text-black">
          Dismiss
        </button>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="flex items-start gap-2 px-4 py-3 bg-white border border-gray-200 rounded text-sm">
        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-semibold text-black">Transaction failed</p>
          <p className="text-xs text-gray-500 mt-0.5">{error}</p>
        </div>
        <button onClick={() => setStep('idle')} className="text-xs text-gray-400 hover:text-black shrink-0">
          Retry
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleWithdraw}
      disabled={isEmpty || step !== 'idle'}
      className="btn-primary w-full"
    >
      <ArrowDownToLine className="w-4 h-4" />
      {step === 'signing'    && 'Waiting for signature…'}
      {step === 'submitting' && 'Submitting…'}
      {step === 'idle' && (
        isEmpty
          ? 'Nothing to withdraw yet'
          : `Withdraw ${amount} ${token}`
      )}
    </button>
  );
}
