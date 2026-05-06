import type { Address } from "viem";
import type { NetworkType } from "../../../../sdk/index.js";
import type { CreditManagerSlice, QuotaSlice } from "../strategy-info/types.js";

interface AdapterContract {
  address: Address;
  contractType: string;
  version: number;
  name: string;
  targetContract: Address;
}

export type CreditManagerDataSlice = CreditManagerSlice & {
  readonly network: NetworkType;
  readonly creditFacade: Address;
  readonly creditConfigurator: Address;
  readonly version: number;
  readonly isPaused: boolean;
  readonly forbiddenTokenMask: bigint;
  readonly isBorrowingForbidden: boolean;
  readonly maxEnabledTokensLength: number;
  readonly name: string;
  readonly marketConfigurator: Address;
  readonly feeLiquidation: number;
  readonly liquidationDiscount: number;
  readonly feeLiquidationExpired: number;
  readonly liquidationDiscountExpired: number;
  readonly supportedTokens: Record<Address, true>;
  readonly usableTokens: Record<Address, true>;
  readonly forbiddenTokens: Record<Address, true>;
  readonly adapters: Record<Address, AdapterContract>;
  readonly contractsByAdapter: Record<Address, Address>;
  readonly quotas: Record<Address, QuotaSlice>;

  isQuoted(token: Address): boolean;
  isForbidden(token: Address): boolean;
};
