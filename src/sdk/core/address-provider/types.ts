import type { Address } from "viem";

import type { BaseParams, IBaseContract } from "../../base";
import type { AddressProviderV3StateHuman } from "../../types";

export interface AddressProviderState {
  baseParams: BaseParams;
  addresses: Record<string, Record<number, Address>>;
}

export interface IAddressProviderContract extends IBaseContract {
  state: AddressProviderState;
  getAddress: (contract: string, version?: number) => Address;
  getLatestVersion: (contract: string) => Address;
  syncState: (blockNumber: bigint) => Promise<void>;
  stateHuman: (raw?: boolean) => AddressProviderV3StateHuman;
}
