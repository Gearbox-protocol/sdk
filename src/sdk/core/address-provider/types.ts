import type { Address } from "viem";

import type { BaseParams, IBaseContract } from "../../base/index.js";
import type { VersionRange } from "../../constants/versions.js";
import type { AddressProviderV3StateHuman } from "../../types/index.js";

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

export interface AddressProviderState {
  baseParams: BaseParams;
  addresses: Record<string, Record<number, Address>>;
}

export interface IAddressProviderContract extends IBaseContract {
  state: AddressProviderState;
  getAddress: (contract: string, version?: number) => Address;
  getLatest: (
    contract: string,
    range: VersionRange,
  ) => [address: Address, version: number] | undefined;
  mustGetLatest: (
    contract: string,
    range: VersionRange,
  ) => [address: Address, version: number];
  syncState: (blockNumber: bigint) => Promise<void>;
  stateHuman: (raw?: boolean) => AddressProviderV3StateHuman;
}
