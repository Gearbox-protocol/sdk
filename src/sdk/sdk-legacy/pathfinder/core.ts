import type { Address } from "viem";

export interface MultiCall {
  target: Address;
  callData: Address;
}

export interface PathFinderResult {
  amount: bigint;
  minAmount: bigint;
  calls: MultiCall[];
}

export interface PathFinderOpenStrategyResult extends PathFinderResult {
  balances: Record<Address, bigint>;
  minBalances: Record<Address, bigint>;
}

export interface PathFinderCloseResult extends PathFinderResult {
  underlyingBalance: bigint;
}
