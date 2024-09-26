import type { Address } from "viem";

import type { MultiCall } from "../../core/transactions";

export enum SwapOperation {
  EXACT_INPUT,
  EXACT_INPUT_ALL,
  EXACT_OUTPUT,
}

export interface SwapTask {
  swapOperation: bigint;
  creditAccount: Address;
  tokenIn: Address;
  tokenOut: Address;
  connectors: Address[];
  amount: bigint;
  leftoverAmount: bigint;
}

export interface PathFinderResult {
  amount: bigint;
  minAmount: bigint;
  calls: Array<MultiCall>;
}

export interface PathFinderOpenStrategyResult extends PathFinderResult {
  balances: Record<string, bigint>;
  minBalances: Record<string, bigint>;
}

export interface RouterResult {
  amount: bigint;
  minAmount: bigint;

  calls: Array<MultiCall>;
}

export interface PathFinderCloseResult extends RouterResult {
  underlyingBalance: bigint;
}

export interface CurvePoolStruct {
  curvePool: Address;
  metapoolBase: Address;
}
