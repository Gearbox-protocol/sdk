import type {
  Chain,
  ContractFunctionParameters,
  MulticallResponse,
  PublicClient,
  Transport,
} from "viem";

/**
 * A group of contract calls owned by a single registry, paired with a callback
 * that receives the results of exactly this group, in the same order.
 *
 * Unlike {@link DelegatedMulticall}, which maps one call to one result, a batch
 * maps N calls to one handler: some loaders need all their results at once
 * (e.g. two calls per token, or a map rebuilt only after every market answered).
 **/
export interface MulticallBatch {
  /** Contract calls of this batch. */
  contracts: ContractFunctionParameters[];
  /** Callback invoked with the results of this batch's calls, in order. */
  onResults: (resps: MulticallResponse[]) => void;
}

/**
 * Options for {@link executeMulticallBatches}.
 **/
export interface ExecuteMulticallBatchesOptions {
  /** Block to read at, defaults to the latest block. */
  blockNumber?: bigint;
}

/**
 * Executes the calls of several {@link MulticallBatch}es as a single multicall
 * aggregate and dispatches each batch its own slice of the results.
 *
 * Failures are allowed per call: loaders in a batch decide themselves how to
 * treat a reverted call (e.g. `contractType()` reverting on a plain ERC-20 is
 * expected). Use {@link executeDelegatedMulticalls} instead when the calls need
 * price updates applied first.
 *
 * @param client - Viem public client.
 * @param batches - Batches to execute together, empty ones are allowed.
 * @param opts - Block number forwarded to the multicall.
 **/
export async function executeMulticallBatches(
  client: PublicClient<Transport, Chain>,
  batches: MulticallBatch[],
  opts: ExecuteMulticallBatchesOptions = {},
): Promise<void> {
  const contracts = batches.flatMap(b => b.contracts);
  if (!contracts.length) {
    return;
  }
  const results = await client.multicall({
    contracts,
    allowFailure: true,
    batchSize: 0,
    blockNumber: opts.blockNumber,
  });
  let offset = 0;
  for (const batch of batches) {
    batch.onResults(results.slice(offset, offset + batch.contracts.length));
    offset += batch.contracts.length;
  }
}
