'use client';

export default function DashboardPage() {
  // TODO: fetch aggregate stats from conduit SDK

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black tracking-tight mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Active streams',   value: '—' },
          { label: 'Total streamed',   value: '—' },
          { label: 'Flow rate / sec',  value: '—' },
          { label: 'Total recipients', value: '—' },
        ].map(s => (
          <div key={s.label} className="card">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-2xl font-black font-mono">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card text-center py-12 text-sm text-gray-400">
        Connect your wallet to see aggregate stats.
      </div>
    </div>
  );
}
