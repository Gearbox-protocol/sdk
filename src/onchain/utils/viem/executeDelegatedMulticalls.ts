import type {
  Chain,
  Client,
  ContractFunctionParameters,
  Transport,
} from "viem";
import type { IPriceUpdateTx } from "../../types/index.js";
import { simulateWithPriceUpdates } from "./simulateWithPriceUpdates.js";

/**
 * A contract call paired with a callback that receives its decoded result.
 * Used to compose batched on-chain reads that are executed together inside a
 * single {@link simulateWithPriceUpdates} call.
 **/
export interface DelegatedMulticall {
  /** Contract call parameters (ABI, address, function name, args). */
  call: ContractFunctionParameters;
  /** Callback invoked with the decoded return value after simulation. */
  onResult: (resp: unknown) => void;
}

/**
 * Executes multiple contract read calls in a single
 * {@link simulateWithPriceUpdates} batch and dispatches each result to its
 * corresponding {@link DelegatedMulticall.onResult} callback.
 *
 * @param client - Viem public client.
 * @param multicalls - Calls to execute with their result handlers.
 * @param opts - Price-update transactions, target block number, and optional
 *   gas limit forwarded to the simulation.
 **/
export async function executeDelegatedMulticalls(
  client: Client<Transport, Chain>,
  multicalls: DelegatedMulticall[],
  opts: { priceUpdates: IPriceUpdateTx[]; blockNumber: bigint; gas?: bigint },
): Promise<void> {
  if (!multicalls.length) return;
  const results = await simulateWithPriceUpdates(client, {
    ...opts,
    contracts: multicalls.map(d => d.call) as any,
  });
  for (let i = 0; i < multicalls.length; i++) {
    multicalls[i].onResult(results[i]);
  }
}
