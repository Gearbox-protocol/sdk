import type {
  ChainId,
  ChainMetadata,
  ChainScoped,
  ChainSucceeded,
  DataResponse,
  DataSource,
} from "../../model/index.js";

/**
 * How many seconds the backend may lag the chain and still be used.
 *
 * One value for every chain: a chain's block time changes how many blocks fit
 * into two minutes, but not what "the backend is two minutes behind" means to
 * whoever reads the number.
 **/
export const DEFAULT_MAX_OFFCHAIN_LAG = 120;

/**
 * Merges two lists chain by chain.
 *
 * Each chain is served whole by one side — the backend when it is no more than
 * `maxLagSeconds` behind the chain, the chain otherwise — so a row is never a
 * mixture of a live token amount and a backend value derived from a different
 * block. A chain no side could serve contributes no rows and one `"error"`
 * entry.
 *
 * Metadata decides which chains exist in the result: rows of a chain that
 * neither side reported are dropped, because a source that answers for a chain
 * without saying so cannot be placed on either side of the freshness
 * comparison.
 *
 * @typeParam T - Row type, which names its own chain.
 * @param onchain - What the chain returned, or `undefined` if it did not.
 * @param offchain - What the backend returned, or `undefined` if it did not.
 * @param maxLagSeconds - Freshness threshold, see
 *   {@link DEFAULT_MAX_OFFCHAIN_LAG}.
 **/
export function mergeChainList<T extends ChainScoped>(
  onchain: DataResponse<T[]> | undefined,
  offchain: DataResponse<T[]> | undefined,
  maxLagSeconds: number = DEFAULT_MAX_OFFCHAIN_LAG,
): DataResponse<T[]> | undefined {
  if (!onchain && !offchain) {
    return undefined;
  }

  const onchainMeta = byChainId(onchain?.meta.chains);
  const offchainMeta = byChainId(offchain?.meta.chains);
  const onchainRows = rowsByChainId(onchain?.data);
  const offchainRows = rowsByChainId(offchain?.data);

  const data: T[] = [];
  const chains: ChainMetadata[] = [];
  for (const chainId of [
    ...onchainMeta.keys(),
    ...[...offchainMeta.keys()].filter(id => !onchainMeta.has(id)),
  ]) {
    const fromChain = onchainMeta.get(chainId);
    const fromBackend = offchainMeta.get(chainId);
    switch (decideChain(fromChain, fromBackend, maxLagSeconds)) {
      case "onchain":
        data.push(...(onchainRows.get(chainId) ?? []));
        chains.push(fromChain as ChainMetadata);
        break;
      case "offchain":
        data.push(...(offchainRows.get(chainId) ?? []));
        chains.push(fromBackend as ChainMetadata);
        break;
      default:
        chains.push(mergedFailure(chainId, fromChain, fromBackend));
    }
  }

  return { data, meta: { chains } };
}

/**
 * Merges two versions of one entity under the same freshness rule as
 * {@link mergeChainList}.
 *
 * The winner is returned whole, metadata included, so the entity and the block
 * it reflects always come from the same source. `undefined` when neither side
 * served it: a single entity has no partial stand-in, so the caller is what
 * decides whether that is a failure or a read still in flight.
 *
 * A detail response describes exactly one chain. A source that reports several
 * is compared on the first, and its metadata is passed through untouched rather
 * than being trimmed to look like the expected shape.
 **/
export function mergeChainOne<T>(
  onchain: DataResponse<T> | undefined,
  offchain: DataResponse<T> | undefined,
  maxLagSeconds: number = DEFAULT_MAX_OFFCHAIN_LAG,
): DataResponse<T> | undefined {
  const winner = decideChain(
    onchain?.meta.chains[0],
    offchain?.meta.chains[0],
    maxLagSeconds,
  );
  switch (winner) {
    case "onchain":
      return onchain;
    case "offchain":
      return offchain;
    default:
      return undefined;
  }
}

/**
 * Which side serves one chain, or `undefined` when neither can.
 **/
function decideChain(
  onchain: ChainMetadata | undefined,
  offchain: ChainMetadata | undefined,
  maxLagSeconds: number,
): DataSource | undefined {
  const fromChain = onchain?.status === "success" ? onchain : undefined;
  const fromBackend = offchain?.status === "success" ? offchain : undefined;
  if (fromChain && fromBackend) {
    return freshEnough(fromChain, fromBackend, maxLagSeconds)
      ? "offchain"
      : "onchain";
  }
  // whichever one answered, however far behind it is: the alternative is
  // reporting a chain as failed while holding data for it
  if (fromChain) {
    return "onchain";
  }
  if (fromBackend) {
    return "offchain";
  }
  return undefined;
}

/**
 * Whether the backend is close enough behind the chain to be preferred.
 **/
function freshEnough(
  onchain: ChainSucceeded,
  offchain: ChainSucceeded,
  maxLagSeconds: number,
): boolean {
  if (offchain.timestamp === undefined) {
    // a source that makes no claim about when its data is from cannot be shown
    // to be fresh
    return false;
  }
  if (onchain.timestamp === undefined) {
    return true;
  }
  return offchain.timestamp >= onchain.timestamp - maxLagSeconds;
}

/**
 * Metadata for a chain the merge could not place on either side.
 *
 * When both sides reported it, no side won it: the entry names no source and
 * carries both reasons. When only one side reported it, that entry is kept as
 * it is, so the other side staying silent is not turned into a failure of its
 * own.
 **/
function mergedFailure(
  chainId: ChainId,
  onchain: ChainMetadata | undefined,
  offchain: ChainMetadata | undefined,
): ChainMetadata {
  if (!onchain || !offchain) {
    return (onchain ?? offchain) as ChainMetadata;
  }
  const reasons = [onchain, offchain]
    .map(chain => (chain.status === "error" ? chain.error : undefined))
    .filter(reason => reason !== undefined);
  return noSourceServed(chainId, reasons);
}

/**
 * The failure of a chain no source served, worded in the one place both the
 * merge and a namespace's total failure report it from.
 *
 * A lone reason is the error itself; several are aggregated, so whoever reads
 * `error` sees what went wrong rather than a wrapper around a single cause.
 **/
export function noSourceServed(
  chainId: ChainId,
  reasons: unknown[],
): ChainMetadata {
  return {
    chainId,
    status: "error",
    error:
      reasons.length === 1
        ? reasons[0]
        : new AggregateError(reasons, `no source could serve chain ${chainId}`),
  };
}

/**
 * Chain entries keyed by chain, first entry of a chain winning: a source is
 * expected to report each chain once, and a repeat must not silently replace
 * what the rest of the merge already decided on.
 **/
function byChainId(
  chains: ChainMetadata[] | undefined,
): Map<ChainId, ChainMetadata> {
  const byChain = new Map<ChainId, ChainMetadata>();
  for (const chain of chains ?? []) {
    if (!byChain.has(chain.chainId)) {
      byChain.set(chain.chainId, chain);
    }
  }
  return byChain;
}

function rowsByChainId<T extends ChainScoped>(
  rows: T[] | undefined,
): Map<ChainId, T[]> {
  const byChain = new Map<ChainId, T[]>();
  for (const row of rows ?? []) {
    const existing = byChain.get(row.chainId);
    if (existing) {
      existing.push(row);
    } else {
      byChain.set(row.chainId, [row]);
    }
  }
  return byChain;
}
