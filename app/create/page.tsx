'use client';

import { useState }          from 'react';
import { useForm }           from 'react-hook-form';
import { zodResolver }       from '@hookform/resolvers/zod';
import { z }                 from 'zod';
import { ArrowRight, Info }  from 'lucide-react';

const schema = z.object({
  recipient:       z.string().min(56, 'Must be a valid Stellar address').max(56),
  token:           z.string().min(1, 'Select a token'),
  depositAmount:   z.string().regex(/^\d+(\.\d+)?$/, 'Enter a valid amount'),
  durationSeconds: z.coerce.number().min(3600, 'Minimum 1 hour'),
  clawback:        z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const TOKENS = [
  { id: 'native', label: 'XLM (native)' },
  { id: 'usdc',   label: 'USDC' },
];

export default function CreatePage() {
  const [step,    setStep]    = useState<1 | 2>(1);
  const [pending, setPending] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { token: 'native', clawback: false, durationSeconds: 2592000 },
  });

  const deposit  = watch('depositAmount');
  const duration = watch('durationSeconds');
  const rate     = deposit && duration
    ? (parseFloat(deposit) * 1e7 / duration).toFixed(2)
    : '—';

  async function onSubmit(data: FormValues) {
    setPending(true);
    try {
      // TODO: call conduit SDK client.streams.create(data)
      console.log('Creating stream:', data);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-black tracking-tight mb-2">Create a stream</h1>
      <p className="text-sm text-gray-500 mb-8">
        Tokens will be deployed into a new DripStream contract and released continuously.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Recipient */}
        <div>
          <label className="block text-xs font-semibold mb-1">Recipient address</label>
          <input
            {...register('recipient')}
            placeholder="G..."
            className="input font-mono"
          />
          {errors.recipient && (
            <p className="text-xs text-red-600 mt-1">{errors.recipient.message}</p>
          )}
        </div>

        {/* Token */}
        <div>
          <label className="block text-xs font-semibold mb-1">Token</label>
          <select {...register('token')} className="input">
            {TOKENS.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Deposit */}
        <div>
          <label className="block text-xs font-semibold mb-1">Total deposit</label>
          <input
            {...register('depositAmount')}
            placeholder="1000"
            className="input"
            type="text"
            inputMode="decimal"
          />
          {errors.depositAmount && (
            <p className="text-xs text-red-600 mt-1">{errors.depositAmount.message}</p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-semibold mb-1">Duration (seconds)</label>
          <input
            {...register('durationSeconds')}
            placeholder="2592000"
            className="input"
            type="number"
          />
          <p className="text-xs text-gray-400 mt-1">
            {duration ? `${Math.round(duration / 86400)} days` : ''}
          </p>
          {errors.durationSeconds && (
            <p className="text-xs text-red-600 mt-1">{errors.durationSeconds.message}</p>
          )}
        </div>

        {/* Rate preview */}
        {deposit && duration && (
          <div className="card bg-gray-50 border-gray-100 flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600">
              Release rate: <span className="font-mono font-semibold text-black">{rate} stroops/s</span>
              {' '}({(parseFloat(deposit) / (duration / 86400)).toFixed(4)} per day)
            </p>
          </div>
        )}

        {/* Clawback */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            {...register('clawback')}
            type="checkbox"
            className="mt-0.5 rounded border-gray-300"
          />
          <div>
            <span className="text-sm font-semibold">Enable clawback</span>
            <p className="text-xs text-gray-500 mt-0.5">
              Allows you to reclaim unstreamed tokens at any time. Cannot be enabled after creation.
            </p>
          </div>
        </label>

        {/* Submit */}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? 'Signing transaction…' : 'Create stream'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
