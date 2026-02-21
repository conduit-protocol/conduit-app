'use client';

import { useEffect, useState } from 'react';
import { useParams }           from 'next/navigation';
import Link                    from 'next/link';
import {
  ArrowLeft, Play, Pause, X,
  ArrowDownToLine, Plus, RotateCcw,
} from 'lucide-react';

import { Badge }        from '@/components/ui/Badge';
import { Card }         from '@/components/ui/Card';
import { ProgressBar }  from '@/components/ui/ProgressBar';
import { RateTicker }   from '@/components/stream/RateTicker';
import { WithdrawButton } from '@/components/stream/WithdrawButton';
import { formatTimestamp, formatDuration, truncateAddress, fromStroops } from '@/lib/format';

// ── Types ────────────────────────────────────────────────────────────────────

type StreamStatus = 'active' | 'paused' | 'ended' | 'cancelled';

interface StreamState {
  id:              string;
  address:         string;
  sender:          string;
  recipient:       string;
  token:           string;
  ratePerSecond:   bigint;
  startTime:       number;
  endTime:         number;
  withdrawn:       bigint;
  paused:          boolean;
  pausedAt:        number;
  cancelled:       boolean;
  clawbackEnabled: boolean;
  // computed
  withdrawable:    bigint;
  balance:         bigint;
  status:          StreamStatus;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function deriveStatus(s: StreamState): StreamStatus {
  if (s.cancelled)                              return 'cancelled';
  if (s.paused)                                 return 'paused';
  const now = Math.floor(Date.now() / 1000);
  if (s.endTime > 0 && now >= s.endTime)        return 'ended';
  if (now < s.startTime)                        return 'active'; // not started yet, show as active
  return 'active';
}

function streamProgress(s: StreamState): number {
  if (s.endTime === 0) return 0;
  const now = Math.floor(Date.now() / 1000);
  if (now <= s.startTime) return 0;
  if (now >= s.endTime)   return 1;
  return (now - s.startTime) / (s.endTime - s.startTime);
}

// ── Mock data (replace with SDK calls) ───────────────────────────────────────

function mockStream(id: string): StreamState {
  const now       = Math.floor(Date.now() / 1000);
  const startTime = now - 3600;
  const endTime   = now + 3600 * 23;
  const rate      = 1157n;                   // ~100 USDC / day in stroops
  const elapsed   = BigInt(now - startTime);
  const withdrawable = rate * elapsed;
  const balance      = rate * 86400n;        // full day deposit
  return {
    id,
    address:         'CSTREAM' + id.padStart(50, '0'),
    sender:          'GABC1111SENDER000000000000000000000000000000000000000',
    recipient:       'GXYZ9999RECIPIENT00000000000000000000000000000000000',
    token:           'USDC',
    ratePerSecond:   rate,
    startTime,
    endTime,
    withdrawn:       0n,
    paused:          false,
    pausedAt:        0,
    cancelled:       false,
    clawbackEnabled: false,
    withdrawable,
    balance,
    status:          'active',
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function StreamPage() {
  const { id }                    = useParams<{ id: string }>();
  const [stream, setStream]       = useState<StreamState | null>(null);
  const [loading, setLoading]     = useState(true);
  const [actionPending, setAction] = useState<string | null>(null);

  useEffect(() => {
    // TODO: replace with actual SDK call
    const s = mockStream(id);
    s.status = deriveStatus(s);
    setStream(s);
    setLoading(false);
  }, [id]);

  async function runAction(name: string, fn: () => Promise<void>) {
    setAction(name);
    try { await fn(); }
    catch (e) { console.error(e); }
    finally { setAction(null); }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-gray-400 text-sm">Loading…</div>
  );
  if (!stream) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-gray-500 text-sm">Stream not found.</div>
  );

  const progress   = streamProgress(stream);
  const isSender   = true;  // TODO: compare with connected wallet address
  const isRecipient = true; // TODO

  const totalDuration = stream.endTime - stream.startTime;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Back */}
      <Link href="/streams" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-black mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> All streams
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs text-gray-400 mb-1 font-mono">{truncateAddress(stream.address)}</p>
          <h1 className="text-2xl font-black tracking-tight">Stream #{stream.id}</h1>
        </div>
        <Badge status={stream.status} />
      </div>

      {/* Live counter — only for active streams */}
      {stream.status === 'active' && (
        <Card className="mb-6 text-center">
          <p className="text-xs text-gray-400 mb-1">Withdrawable now</p>
          <p className="text-4xl font-black font-mono tabular-nums">
            <RateTicker
              ratePerSecond={stream.ratePerSecond}
              startBalance={stream.withdrawable}
            />
          </p>
          <p className="text-xs text-gray-400 mt-1">{stream.token}</p>
        </Card>
      )}

      {/* Progress bar */}
      {stream.endTime > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>{formatTimestamp(stream.startTime)}</span>
            <span>{Math.round(progress * 100)}% streamed</span>
            <span>{formatTimestamp(stream.endTime)}</span>
          </div>
          <ProgressBar value={progress} />
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            {formatDuration(totalDuration)} total duration
          </p>
        </div>
      )}

      {/* Stream details */}
      <Card className="mb-6">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            {[
              { label: 'Sender',          value: truncateAddress(stream.sender) },
              { label: 'Recipient',       value: truncateAddress(stream.recipient) },
              { label: 'Token',           value: stream.token },
              { label: 'Rate',            value: `${fromStroops(stream.ratePerSecond)} / sec` },
              { label: 'Total deposited', value: fromStroops(stream.balance + stream.withdrawn) },
              { label: 'Withdrawn',       value: fromStroops(stream.withdrawn) },
              { label: 'Clawback',        value: stream.clawbackEnabled ? 'Enabled' : 'Disabled' },
            ].map(({ label, value }) => (
              <tr key={label}>
                <td className="py-2.5 text-gray-400 w-40">{label}</td>
                <td className="py-2.5 font-mono text-black text-right">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Actions */}
      <div className="space-y-3">

        {/* Withdraw — recipient only, active or paused */}
        {isRecipient && (stream.status === 'active' || stream.status === 'paused') && (
          <WithdrawButton
            streamId={stream.id}
            withdrawable={stream.withdrawable}
            token={stream.token}
            onSuccess={() => {
              // TODO: refresh stream state
            }}
          />
        )}

        {/* Sender actions */}
        {isSender && stream.status === 'active' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => runAction('pause', async () => {
                // TODO: await conduit.streams.pause(stream.id)
              })}
              disabled={actionPending !== null}
              className="btn-secondary"
            >
              <Pause className="w-4 h-4" />
              {actionPending === 'pause' ? 'Pausing…' : 'Pause'}
            </button>

            <button
              onClick={() => runAction('cancel', async () => {
                // TODO: await conduit.streams.cancel(stream.id)
              })}
              disabled={actionPending !== null}
              className="btn-secondary text-gray-600 hover:text-black"
            >
              <X className="w-4 h-4" />
              {actionPending === 'cancel' ? 'Cancelling…' : 'Cancel'}
            </button>
          </div>
        )}

        {isSender && stream.status === 'paused' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => runAction('resume', async () => {
                // TODO: await conduit.streams.resume(stream.id)
              })}
              disabled={actionPending !== null}
              className="btn-secondary"
            >
              <Play className="w-4 h-4" />
              {actionPending === 'resume' ? 'Resuming…' : 'Resume'}
            </button>

            <button
              onClick={() => runAction('cancel', async () => {})}
              disabled={actionPending !== null}
              className="btn-secondary"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}

        {/* Top-up */}
        {isSender && (stream.status === 'active' || stream.status === 'paused') && (
          <button
            className="btn-secondary w-full"
            onClick={() => runAction('topup', async () => {
              // TODO: prompt amount, await conduit.streams.topUp(stream.id, amount)
            })}
            disabled={actionPending !== null}
          >
            <Plus className="w-4 h-4" /> Top up
          </button>
        )}

        {/* Clawback */}
        {isSender && stream.clawbackEnabled && stream.status === 'active' && (
          <button
            className="btn-ghost w-full text-xs text-gray-500"
            onClick={() => runAction('clawback', async () => {
              // TODO: await conduit.streams.clawback(stream.id)
            })}
            disabled={actionPending !== null}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clawback unstreamed tokens
          </button>
        )}
      </div>

      {/* Clawback warning */}
      {stream.clawbackEnabled && stream.status !== 'cancelled' && (
        <p className="mt-4 text-xs text-gray-400 border border-gray-200 rounded p-3">
          ⚠ This stream has clawback enabled. The sender may reclaim unstreamed tokens at any time.
        </p>
      )}
    </div>
  );
}
