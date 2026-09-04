import type { ChainId, Timestamp } from "./primitives.js";

/**
 * Shared response envelope: the payload plus per-chain metadata naming which
 * source served each chain.
 *
 * The backend sends this on HTTP success only. Transport failures, timeouts,
 * and backend error bodies are not an envelope — the offchain client wraps
 * those, because the request may never have reached the backend.
 *
 * @typeParam T - Payload type
 **/
export interface DataResponse<T> {
  /**
   * Response payload.
   **/
  data: T;
  /**
   * Per-chain outcome of the read, see {@link ResponseMetadata}.
   **/
  meta: ResponseMetadata;
}

/**
 * Per-chain outcomes attached to every {@link DataResponse}.
 **/
export interface ResponseMetadata {
  /**
   * One entry per chain the read asked. After a merge, each success names the
   * side that won it in {@link ChainSucceeded.source}, so a consumer can tell
   * a chain served live from a chain served by the backend without per-row
   * provenance.
   **/
  chains: ChainMetadata[];
}

/**
 * Which side produced a chain's data.
 **/
export type DataSource = "onchain" | "offchain";

/**
 * Chain that answered, which source served it, and the block it answered from.
 *
 * Discriminated from {@link ChainFailed} on {@link status}, so a success
 * without a source, or without the block it reflects, is unrepresentable.
 **/
export interface ChainSucceeded {
  /**
   * Chain the entry describes.
   **/
  chainId: ChainId;
  status: "success";
  /**
   * Source that produced this chain's data. Never absent on success: some
   * source produced it.
   **/
  source: DataSource;
  /**
   * Block the data reflects. A `number` here (model convention), converted
   * from `bigint` at the onchain boundary. A chain that cannot say which block
   * it answered from is a {@link ChainFailed}.
   **/
  blockNumber: number;
  /**
   * Unix seconds of {@link blockNumber}.
   **/
  timestamp: Timestamp;
}

/**
 * Chain that did not answer.
 **/
export interface ChainFailed {
  /**
   * Chain the entry describes.
   **/
  chainId: ChainId;
  status: "error";
  /**
   * Source that failed this chain. Absent when every source failed for it, so
   * no side won it.
   **/
  source?: DataSource;
  /**
   * Rejection reason. A `string` in a JSON response, an `Error` (or an
   * `AggregateError` when both sources failed) when produced locally.
   *
   * Serialises to `{}` if an envelope carrying a real `Error` is put into
   * Redux or a log as-is.
   **/
  error?: unknown;
}

/**
 * Per-chain outcome, discriminated on {@link ChainSucceeded.status} /
 * {@link ChainFailed.status}.
 **/
export type ChainMetadata = ChainSucceeded | ChainFailed;

/**
 * Anything the read model scopes to one chain, i.e. every list row.
 **/
export interface ChainScoped {
  /**
   * Chain the row lives on.
   **/
  chainId: ChainId;
}
