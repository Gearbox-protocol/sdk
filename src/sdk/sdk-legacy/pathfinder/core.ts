import type { Address } from "viem";

import type { MultiCall } from "../../types";

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
