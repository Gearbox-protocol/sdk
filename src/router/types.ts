import { Address } from "viem";
import { MultiCall } from "../../core/transactions";

export enum SwapOperation {
  EXACT_INPUT,
  EXACT_INPUT_ALL,
  EXACT_OUTPUT,
}

export type SwapTask = {
  swapOperation: bigint;
  creditAccount: Address;
  tokenIn: Address;
  tokenOut: Address;
  connectors: Address[];
  amount: bigint;
  leftoverAmount: bigint;
};

export type PathFinderResult = {
  amount: bigint;
  minAmount: bigint;
  calls: Array<MultiCall>;
};

export interface PathFinderOpenStrategyResult extends PathFinderResult {
  balances: Record<string, bigint>;
  minBalances: Record<string, bigint>;
}

export type RouterResult = {
  amount: bigint;
  minAmount: bigint;

  calls: Array<MultiCall>;
};

export interface PathFinderCloseResult extends RouterResult {
  underlyingBalance: bigint;
}

export type CurvePoolStruct = {
  curvePool: Address;
  metapoolBase: Address;
};
