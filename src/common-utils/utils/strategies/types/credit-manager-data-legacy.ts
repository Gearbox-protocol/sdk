import type { Address } from "viem";
import type { NetworkType } from "../../../../sdk/index.js";
import type { QuotaSlice } from "../strategy-info/types.js";
import type { StrategyCreditManagerView } from "./strategy-data-source.js";

interface AdapterContract {
  address: Address;
  contractType: string;
  version: number;
  name: string;
  targetContract: Address;
}

export type CreditManagerDataSlice = StrategyCreditManagerView & {
  readonly network: NetworkType;
  readonly creditFacade: Address;
  readonly creditConfigurator: Address;
  readonly isPaused: boolean;
  readonly forbiddenTokenMask: bigint;
  readonly maxEnabledTokensLength: number;
  readonly name: string;
  readonly feeLiquidation: number;
  readonly liquidationDiscount: number;
  readonly feeLiquidationExpired: number;
  readonly liquidationDiscountExpired: number;
  readonly usableTokens: Record<Address, true>;
  readonly adapters: Record<Address, AdapterContract>;
  readonly contractsByAdapter: Record<Address, Address>;
  readonly quotas: Record<Address, QuotaSlice>;

  isQuoted(token: Address): boolean;
  isForbidden(token: Address): boolean;
};
