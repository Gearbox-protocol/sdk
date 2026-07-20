import type { WithdrawalsState } from "../accounts/withdrawal-compressor/types.js";
import type { MarketData } from "../base/index.js";
import type { NetworkType } from "../chain/chains.js";
import type { AddressProviderState } from "../core/index.js";
import type { ZapperData } from "../market/index.js";
import type { RWAState } from "../market/rwa/index.js";
import type { PluginStatesMap, PluginsMap } from "../plugins/index.js";

/**
 * Complete serialisable snapshot of the SDK state for a single chain.
 *
 * Produced by {@link OnchainSDK.state} and consumed by
 * {@link OnchainSDK.hydrate} for instant offline restoration.
 *
 * @typeParam Plugins - Map of plugin names to plugin instances.
 **/
export interface GearboxState<Plugins extends PluginsMap = {}> {
  /**
   * State format version, checked during hydration.
   * This is *not* the `@gearbox-protocol/sdk` package version.
   **/
  version: number;
  /**
   * Gearbox network type the snapshot was taken from.
   **/
  network: NetworkType;
  /**
   * EVM chain ID the snapshot was taken from.
   **/
  chainId: number;
  /**
   * Block number the snapshot corresponds to.
   **/
  currentBlock: bigint;
  /**
   * Block timestamp (Unix epoch seconds).
   **/
  timestamp: bigint;
  /**
   * Address provider contract state.
   **/
  addressProvider: AddressProviderState;
  /**
   * All loaded market data.
   **/
  markets: MarketData[];
  /**
   * RWA compressor state snapshot, if RWA factories were loaded.
   **/
  rwa?: RWAState;
  /**
   * All loaded zappers, keyed implicitly by their `pool` field.
   *
   * Present only when zappers were loaded (they are optional)
   **/
  zappers?: ZapperData[];
  /**
   * Withdrawal compressor's withdrawable assets cache.
   *
   * Present only when the compressor exists on the chain and its assets
   * were loaded
   **/
  withdrawals?: WithdrawalsState;
  /**
   * Per-plugin serialised state.
   **/
  plugins: PluginStatesMap<Plugins>;
}

/**
 * Serialised state for all chains managed by {@link MultichainSDK}.
 *
 * @typeParam Plugins - Map of plugin names to plugin instances.
 **/
export interface MultichainState<Plugins extends PluginsMap = {}> {
  /** State format version. */
  version: number;
  /** Per-chain serialised state. */
  chains: GearboxState<Plugins>[];
}
