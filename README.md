# conduit-app

The web interface for the Conduit streaming payments protocol. Create, manage, and monitor payment streams — all in a browser.

Built with [Next.js 15](https://nextjs.org) (App Router), [Stellar Wallets Kit](https://stellarwalletskit.dev), and Tailwind CSS. Design: **black and white only** — no accent colours.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — protocol overview and call to action |
| `/streams` | Your streams dashboard — active, ended, and created |
| `/create` | Create a new stream — token, recipient, rate, duration |
| `/stream/[id]` | Single stream view — progress, withdraw, top-up, cancel |
| `/dashboard` | Sender overview — aggregate flow rate, total disbursed |

---

## Design Principles

- **Black and white only.** No colour utilities outside `text-black`, `text-white`, `bg-black`, `bg-white`, and the grey scale (`gray-*`). Contrast and hierarchy are achieved through weight, size, and spacing alone.
- **No rounded corners on primary containers.** Cards and panels use `rounded-none` or `rounded-sm`. Interactive elements (buttons, inputs) use `rounded`.
- **Monospaced numbers.** All amounts and timestamps use `font-mono tabular-nums`.
- **Dense layouts.** Information density over decoration.

---

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | Next.js 15 (App Router) |
| Wallet | Stellar Wallets Kit |
| Blockchain reads | `@stellar/stellar-sdk` |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| Dates | `date-fns` |
| State | React Context + `useReducer` |

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| A Stellar-compatible wallet | Freighter, xBull, Albedo, etc. |

---

## Setup

```bash
git clone https://github.com/conduit-protocol/conduit-app
cd conduit-app
npm install
```

Copy the environment file and fill in the values:

```bash
cp .env.example .env.local
```

```env
# .env.local

# Soroban RPC endpoint
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# Network passphrase
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# Deployed contract IDs (from conduit-contracts deploy)
NEXT_PUBLIC_FACTORY_CONTRACT_ID=C...
NEXT_PUBLIC_GOVERNOR_CONTRACT_ID=C...

# Optional — Horizon for account info
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
```

Start the development server:

```bash
npm run dev
# → http://localhost:3000
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm test` | Run Vitest unit tests |

---

## Directory Structure

```
conduit-app/
├── app/
│   ├── layout.tsx              # Root layout — Providers, Navbar, footer
│   ├── page.tsx                # Landing page
│   ├── (marketing)/
│   │   └── about/page.tsx      # Protocol explainer
│   ├── streams/
│   │   └── page.tsx            # Stream list — sender + recipient views
│   ├── stream/
│   │   └── [id]/page.tsx       # Single stream detail + actions
│   ├── create/
│   │   └── page.tsx            # Create stream form
│   └── dashboard/
│       └── page.tsx            # Aggregate sender stats
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # Primary, secondary, ghost variants
│   │   ├── Card.tsx            # Content container
│   │   ├── Input.tsx           # Text, number, address inputs
│   │   ├── Badge.tsx           # Status labels (Active, Ended, Paused)
│   │   ├── ProgressBar.tsx     # Stream drain visualisation
│   │   └── Modal.tsx           # Dialog wrapper
│   ├── stream/
│   │   ├── StreamCard.tsx      # Summary card used in /streams list
│   │   ├── StreamDetail.tsx    # Full detail view with withdraw / cancel
│   │   ├── CreateForm.tsx      # Multi-step create wizard
│   │   ├── WithdrawButton.tsx  # Withdraw with pending state
│   │   └── RateTicker.tsx      # Live per-second counter
│   ├── Navbar.tsx              # Top navigation
│   ├── ConnectButton.tsx       # Stellar Wallets Kit connect trigger
│   └── Providers.tsx           # Context providers tree
├── lib/
│   ├── soroban.ts              # Soroban client + contract helpers
│   ├── factory.ts              # DripFactory call wrappers
│   ├── stream.ts               # DripStream call wrappers
│   ├── tokens.ts               # Known Stellar asset list
│   └── format.ts               # Amount formatting, time helpers
├── contexts/
│   └── WalletContext.tsx       # Wallet state + sign helpers
├── tailwind.config.ts          # B&W-only token config
├── next.config.ts
├── tsconfig.json
├── .env.example
└── .github/
    └── workflows/
        └── ci.yml              # lint + typecheck + test on PR
```

---

## Contract Integration

All contract calls go through `lib/soroban.ts`:

```typescript
import { buildInvokeContractOp, SorobanRpc } from '@stellar/stellar-sdk';

// Read-only (simulation only)
export async function getWithdrawable(streamId: string): Promise<bigint>

// Mutating (simulation → assemble → sign → submit)
export async function withdraw(streamId: string, amount: bigint): Promise<string>
export async function cancel(streamId: string): Promise<string>
export async function pause(streamId: string): Promise<string>
export async function resume(streamId: string): Promise<string>
export async function topUp(streamId: string, amount: bigint): Promise<string>
```

Transactions are assembled on the client via Soroban simulation, signed by the connected wallet (Stellar Wallets Kit `signTransaction`), then submitted to the configured RPC.

---

## RateTicker

The `RateTicker` component renders a live counter that increments in real time:

```tsx
<RateTicker
  ratePerSecond={stream.ratePerSecond}  // bigint, in stroops
  startBalance={stream.withdrawable}    // bigint, current withdrawable
/>
```

Every 100 ms it recalculates `withdrawable = storedWithdrawable + (now - lastFetch) * ratePerSecond` and displays the result. No contract call — pure arithmetic.

---

## Styling Rules (for contributors)

```
✓  text-black   text-white   text-gray-*
✓  bg-black     bg-white     bg-gray-*
✓  border-black border-white border-gray-*
✓  ring-black   ring-white   ring-gray-*

✗  text-blue-*  text-red-*  bg-indigo-*  (any hue-named colour)
✗  text-primary  bg-accent  (semantic aliases that resolve to colour)
```

The only exception is `text-green-600` and `text-red-600` for positive/negative balance deltas, and those must be wrapped in a `<span aria-label="...">` with a text fallback so colour is never the sole signal.

---

## Contributing

See the root [`CONTRIBUTING.md`](../CONTRIBUTING.md). For UI-specific conventions, read [`components/ui/README.md`](./components/ui/README.md) before adding new components.

---

## License

MIT — see [`LICENSE`](./LICENSE).
