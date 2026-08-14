import type { NetworkType } from "../chain/chains.js";

/**
 * Selects the chain for single-account methods of a multichain service.
 **/
export interface MultichainNetworkProps {
  /**
   * Network the entity lives on.
   **/
  network: NetworkType;
}

/**
 * Restricts which chains a multichain list method queries.
 **/
export interface MultichainNetworksProps {
  /**
   * Networks to query. All chains configured in {@link MultichainSDK} when
   * omitted.
   **/
  networks?: NetworkType[];
}

/**
 * Adds chain-scoping props `T` only when the service spans multiple chains.
 **/
export type WithMultichain<
  Multichain extends boolean,
  T extends object,
> = Multichain extends true ? T : {};

/**
 * Pins a live read to a block. Only meaningful on one chain: a height is not
 * a shared moment across networks.
 **/
export interface BlockNumberProps {
  /**
   * Block to read at. Defaults to the latest block.
   **/
  blockNumber?: bigint;
}

/**
 * Adds {@link BlockNumberProps} only for a single-chain call. Fan-out methods
 * omit it so a caller cannot pass one height to every network.
 **/
export type WithBlock<Multichain extends boolean> = Multichain extends true
  ? {}
  : BlockNumberProps;

/**
 * Outcome of a fan-out request on a single chain.
 **/
export interface MultichainNetworkMeta {
  /**
   * Network the request was sent to.
   **/
  network: NetworkType;
  /**
   * Whether the per-chain request succeeded.
   **/
  status: "success" | "error";
  /**
   * Rejection reason of the per-chain request. Only set when
   * {@link status} is `"error"`.
   **/
  error?: unknown;
}

/**
 * Result of a multichain fan-out request: the combined payload of all
 * successful chains plus the outcome of every queried chain.
 *
 * Methods with no payload use `MultichainResult<void>`, i.e. `result` is
 * `undefined` and only {@link meta} carries information.
 *
 * @typeParam T - Combined payload type.
 **/
export interface MultichainResult<T> {
  /**
   * Combined payload of the chains that responded successfully. Chains that
   * failed contribute nothing and are reported in {@link meta}.
   **/
  result: T;
  /**
   * Per-chain request outcome, one entry per queried chain.
   **/
  meta: MultichainNetworkMeta[];
}
