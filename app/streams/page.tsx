'use client';

import { useState } from 'react';
import Link        from 'next/link';
import { Plus }    from 'lucide-react';

type Tab = 'receiving' | 'sending';

export default function StreamsPage() {
  const [tab, setTab] = useState<Tab>('receiving');

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black tracking-tight">Streams</h1>
        <Link href="/create" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New stream
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {(['receiving', 'sending'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'px-4 py-2 text-sm font-semibold -mb-px border-b-2 transition-colors',
              tab === t
                ? 'border-black text-black'
                : 'border-transparent text-gray-400 hover:text-black',
            ].join(' ')}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Stream list placeholder — wire to conduit SDK */}
      <div className="space-y-3">
        <div className="card text-center py-12 text-gray-400 text-sm">
          Connect your wallet to see your streams.
        </div>
      </div>
    </div>
  );
}
