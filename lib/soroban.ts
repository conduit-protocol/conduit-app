/**
 * Soroban client helpers for conduit-app.
 *
 * Thin wrappers around @stellar/stellar-sdk's SorobanRpc that handle
 * the simulate → assemble → sign → submit → poll pipeline.
 *
 * All signing goes through the WalletContext `signTx` callback so this
 * module never holds key material.
 */

import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  xdr,
} from '@stellar/stellar-sdk';

// ── Config ────────────────────────────────────────────────────────────────────

const RPC_URL      = process.env['NEXT_PUBLIC_SOROBAN_RPC_URL']!;
const PASSPHRASE   = process.env['NEXT_PUBLIC_NETWORK_PASSPHRASE']!;

export const server = new SorobanRpc.Server(RPC_URL, {
  allowHttp: RPC_URL.startsWith('http://'),
});

// ── Core pipeline ─────────────────────────────────────────────────────────────

/**
 * Build a contract-call transaction, simulate it to get the fee + footprint,
 * assemble it, hand it to the wallet for signing, then submit and poll.
 *
 * @param source     Stellar public key of the invoker
 * @param contractId Contract address (C…)
 * @param method     Function name
 * @param args       XDR ScVal arguments
 * @param signTx     Wallet sign callback from WalletContext
 * @returns          Transaction hash
 */
export async function invokeContract(
  source:     string,
  contractId: string,
  method:     string,
  args:       xdr.ScVal[],
  signTx:     (xdrBase64: string) => Promise<string>,
): Promise<string> {
  const account = await server.getAccount(source);

  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, {
    fee:             BASE_FEE,
    networkPassphrase: PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(180)
    .build();

  // Simulate to get auth + footprint
  const simResult = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation failed: ${simResult.error}`);
  }

  // Assemble
  const assembled = SorobanRpc.assembleTransaction(tx, simResult).build();
  const xdrBase64 = assembled.toEnvelope().toXDR('base64');

  // Sign via wallet
  const signedXdr = await signTx(xdrBase64);
  const signedTx  = TransactionBuilder.fromXDR(signedXdr, PASSPHRASE);

  // Submit
  const sendResult = await server.sendTransaction(signedTx);
  if (sendResult.status === 'ERROR') {
    throw new Error(`Submission failed: ${JSON.stringify(sendResult.errorResult)}`);
  }

  // Poll
  const hash = sendResult.hash;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    const status = await server.getTransaction(hash);
    if (status.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) return hash;
    if (status.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transaction failed: ${hash}`);
    }
  }
  throw new Error(`Transaction timed out: ${hash}`);
}

/**
 * Simulate a read-only contract call and return the decoded result.
 *
 * @param source     Any Stellar public key (just needs to exist on-chain)
 * @param contractId Contract address
 * @param method     Read-only function name
 * @param args       XDR ScVal arguments
 * @returns          Raw ScVal result
 */
export async function simulateReadOnly(
  source:     string,
  contractId: string,
  method:     string,
  args:       xdr.ScVal[],
): Promise<xdr.ScVal> {
  const account  = await server.getAccount(source);
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, {
    fee:             BASE_FEE,
    networkPassphrase: PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(60)
    .build();

  const result = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(result)) {
    throw new Error(`Simulation error: ${result.error}`);
  }
  if (!result.result) throw new Error('No result returned from simulation');

  return xdr.ScVal.fromXDR(result.result.retval.toXDR());
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

/** Convert an i128 ScVal to bigint */
export function scValToI128(val: xdr.ScVal): bigint {
  const i128 = val.i128();
  const hi   = BigInt(i128.hi().toString());
  const lo   = BigInt(i128.lo().toString());
  return (hi << 64n) | lo;
}

/** Convert a u64 ScVal to bigint */
export function scValToU64(val: xdr.ScVal): bigint {
  return BigInt(val.u64().toString());
}
