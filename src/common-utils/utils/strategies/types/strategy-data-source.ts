import type { Address } from "viem";

import type {
  CreditManagerSlice,
  PoolSlice,
  TokenSlice,
} from "../strategy-info/types.js";

export interface StrategyCreditManagerView extends CreditManagerSlice {
  readonly version: number;
  readonly isBorrowingForbidden: boolean;
  readonly marketConfigurator: Address;
  readonly supportedTokens: Record<Address, true>;
  readonly forbiddenTokens: Record<Address, true>;
}

export type StrategyPoolView = PoolSlice;
export type StrategyTokenView = TokenSlice;

export interface StrategyDataSource<
  CM extends StrategyCreditManagerView = StrategyCreditManagerView,
> {
  hasToken(chainId: number, token: Address): boolean;
  getToken(chainId: number, token: Address): StrategyTokenView | undefined;
  getPool(chainId: number, pool: Address): StrategyPoolView | undefined;
  getCreditManager(chainId: number, creditManager: Address): CM | undefined;
  getMarketPrices(chainId: number, pool: Address): Record<Address, bigint>;
  getLastSyncTimestamp(chainId: number): number | undefined;
}
