import type { Address } from "viem";

export enum SwapOperation {
  EXACT_INPUT,
  EXACT_INPUT_ALL,
  EXACT_OUTPUT,
}

export interface MultiCall {
  target: Address;
  callData: Address;
}
export interface SwapTask {
  swapOperation: number;
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
  calls: MultiCall[];
}

export interface PathFinderOpenStrategyResult extends PathFinderResult {
  balances: Record<Address, bigint>;
  minBalances: Record<Address, bigint>;
}

export interface PathFinderCloseResult extends PathFinderResult {
  underlyingBalance: bigint;
}
