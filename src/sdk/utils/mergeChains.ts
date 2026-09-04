import type {
  ChainId,
  ChainMetadata,
  ChainScoped,
  ChainSucceeded,
  DataResponse,
  DataSource,
} from "../../model/index.js";
import { NoSourceServedError } from "../errors/index.js";
import type { MergeListResult } from "./types.js";

/**
 * How many seconds the backend may lag the chain and still be used.
 **/
export const DEFAULT_MAX_OFFCHAIN_LAG = 120;

/**
 * Merges two lists chain by chain: a chain is served by the backend when it is
 * within `maxLagSeconds` of the chain, by the chain otherwise, and reported as
 * an error when neither source succeeded. Answers with an envelope as soon as
 * either side has arrived, see {@link MergeListResult}.
 **/
export function mergeChainList<
  T extends ChainScoped,
  Onchain extends DataResponse<T[]> | undefined,
  Offchain extends DataResponse<T[]> | undefined,
>(
  onchain: Onchain,
  offchain: Offchain,
  maxLagSeconds?: number,
): MergeListResult<Onchain, Offchain, T[]>;
export function mergeChainList<T extends ChainScoped>(
  onchain: DataResponse<T[]> | undefined,
  offchain: DataResponse<T[]> | undefined,
  maxLagSeconds: number = DEFAULT_MAX_OFFCHAIN_LAG,
): DataResponse<T[]> | undefined {
  if (!onchain && !offchain) {
    return undefined;
  }

  const fromOnchain = new Map<ChainId, ChainMetadata>();
  for (const chain of onchain?.meta.chains ?? []) {
    fromOnchain.set(chain.chainId, chain);
  }
  const fromOffchain = new Map<ChainId, ChainMetadata>();
  for (const chain of offchain?.meta.chains ?? []) {
    fromOffchain.set(chain.chainId, chain);
  }

  const data: T[] = [];
  const chains: ChainMetadata[] = [];
  // metadata decides which chains exist: a source that did not report a chain
  // cannot be placed on either side of the freshness comparison
  for (const chainId of new Set([
    ...fromOnchain.keys(),
    ...fromOffchain.keys(),
  ])) {
    const onchainMeta = fromOnchain.get(chainId);
    const offchainMeta = fromOffchain.get(chainId);
    const winner = pickSource(onchainMeta, offchainMeta, maxLagSeconds);
    if (winner === "onchain" && onchain && onchainMeta) {
      data.push(...onchain.data.filter(row => row.chainId === chainId));
      chains.push(onchainMeta);
    } else if (winner === "offchain" && offchain && offchainMeta) {
      data.push(...offchain.data.filter(row => row.chainId === chainId));
      chains.push(offchainMeta);
    } else {
      chains.push(failedChain(chainId, onchainMeta, offchainMeta));
    }
  }

  return { data, meta: { chains } };
}

/**
 * Merges two versions of one entity under the same freshness rule as
 * {@link mergeChainList}, returning the winning response whole.
 **/
export function mergeChainOne<T>(
  onchain: DataResponse<T> | undefined,
  offchain: DataResponse<T> | undefined,
  maxLagSeconds: number = DEFAULT_MAX_OFFCHAIN_LAG,
): DataResponse<T> | undefined {
  const winner = pickSource(
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
function pickSource(
  onchain: ChainMetadata | undefined,
  offchain: ChainMetadata | undefined,
  maxLagSeconds: number,
): DataSource | undefined {
  const onchainOk = onchain?.status === "success" ? onchain : undefined;
  const offchainOk = offchain?.status === "success" ? offchain : undefined;
  if (onchainOk && offchainOk) {
    return isFresh(onchainOk, offchainOk, maxLagSeconds)
      ? "offchain"
      : "onchain";
  }
  // whichever one succeeded, however far behind it is: the alternative is
  // reporting a chain as failed while holding data for it
  if (onchainOk) {
    return "onchain";
  }
  if (offchainOk) {
    return "offchain";
  }
  return undefined;
}

/**
 * Whether the backend is close enough behind the chain to be preferred.
 **/
function isFresh(
  onchain: ChainSucceeded,
  offchain: ChainSucceeded,
  maxLagSeconds: number,
): boolean {
  return offchain.timestamp >= onchain.timestamp - maxLagSeconds;
}

/**
 * Metadata for a chain neither source served.
 **/
function failedChain(
  chainId: ChainId,
  onchain: ChainMetadata | undefined,
  offchain: ChainMetadata | undefined,
): ChainMetadata {
  // only one source reported it, so its entry is kept as it is: the other one
  // staying silent is not a failure of its own
  if (!onchain || !offchain) {
    return (onchain ?? offchain) as ChainMetadata;
  }
  const reasons = [onchain, offchain]
    .map(chain => (chain.status === "error" ? chain.error : undefined))
    .filter(reason => !!reason);
  return {
    chainId,
    status: "error",
    error:
      reasons.length === 1
        ? reasons[0]
        : new NoSourceServedError(chainId, reasons),
  };
}
