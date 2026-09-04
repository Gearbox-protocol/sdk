import type { ChainId } from "../../model/primitives.js";
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
export interface MultichainChainIdsProps {
  /**
   * Chains to query. All chains configured in {@link MultichainSDK} when
   * omitted, and one the SDK is not configured for is dropped.
   *
   * A caller who thinks in network labels converts with {@link toChainIds}.
   **/
  chainIds?: ChainId[];
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
