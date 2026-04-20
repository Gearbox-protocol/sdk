import type { Address } from "viem";
import type { MarketData } from "../base/index.js";
import type { NetworkType } from "../chain/chains.js";
import type { AddressProviderState } from "../core/index.js";
import type { KYCState } from "../market/kyc/index.js";
import type { PluginStatesMap, PluginsMap } from "../plugins/index.js";

/**
 * Complete serialisable snapshot of the Gearbox SDK state.
 *
 * Produced by {@link GearboxSDK.state} and consumed by
 * {@link GearboxSDK.hydrate} for instant offline restoration.
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
   * KYC compressor state snapshot, if KYC factories were loaded.
   **/
  kyc?: KYCState;
  /**
   * Per-plugin serialised state.
   **/
  plugins: PluginStatesMap<Plugins>;
}
