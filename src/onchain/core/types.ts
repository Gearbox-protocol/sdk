import type { Address } from "viem";

import type { BaseParams, IBaseContract } from "../base/index.js";
import type { VersionRange } from "../constants/versions.js";
import type { AddressProviderV3StateHuman } from "../types/index.js";

export interface AddressProviderAddresses {
  /**
   * Initialize address provider with these addresses
   * Used in hydration
   */
  addresses?: Record<string, Record<number, Address>>;
  /**
   * Override addresses for this address provider
   * These addresses will precede over addresses loaded from chain
   *
   * This is an escape hatch.
   * We used it when we need to fix price feed compressor/market compressor urgently
   */
  overrides?: Record<string, Record<number, Address>>;
}

/**
 * Serializable snapshot of the address provider's current state,
 * including its on-chain identity and all registered contract addresses.
 **/
export interface AddressProviderState {
  /**
   * On-chain identification parameters for the address provider itself.
   **/
  baseParams: BaseParams;
  /**
   * Registered addresses keyed by contract name, then by version number.
   **/
  addresses: Record<string, Record<number, Address>>;
}

/**
 * Public interface for the Gearbox address provider contract.
 *
 * The address provider is the single entry-point for discovering all other
 * Gearbox contracts on a given chain. It maps `(contractName, version)` pairs
 * to on-chain addresses.
 **/
export interface IAddressProviderContract extends IBaseContract {
  /**
   * Serializable snapshot of the provider's current state.
   **/
  state: AddressProviderState;
  /**
   * Resolves the address of a registered contract by name and version.
   * @param contract - Registered contract name (e.g. `"MARKET_COMPRESSOR"`).
   * @param version - Version number to look up. Defaults to 0 - contract without versioning
   * @throws If no address is registered for the given name and version.
   **/
  getAddress: (contract: string, version?: number) => Address;
  /**
   * Finds the highest-versioned address within a version range.
   * @param contract - Registered contract name.
   * @param range - Inclusive `[min, max]` version range to search.
   * @returns A `[address, version]` tuple, or `undefined` if none match.
   **/
  getLatest: (
    contract: string,
    range: VersionRange,
  ) => [address: Address, version: number] | undefined;
  /**
   * Like {@link getLatest}, but throws if no address is found in the range.
   * @param contract - Registered contract name.
   * @param range - Inclusive `[min, max]` version range to search.
   * @throws If no address is registered in the given range.
   **/
  mustGetLatest: (
    contract: string,
    range: VersionRange,
  ) => [address: Address, version: number];
  /**
   * Re-reads all registered addresses from chain at the given block.
   * @param blockNumber - Block number to read state at.
   **/
  syncState: (blockNumber: bigint) => Promise<void>;
  /**
   * Returns a human-readable snapshot of the address provider state.
   * @param raw - When `true`, includes raw/unformatted values alongside display strings.
   **/
  stateHuman: (raw?: boolean) => AddressProviderV3StateHuman;
}
