import { MultiCallStructOutput } from "../types/IRouter";

export enum SwapOperation {
  EXACT_INPUT,
  EXACT_INPUT_ALL,
  EXACT_OUTPUT,
}

export interface PathFinderResult {
  amount: bigint;
  calls: Array<MultiCallStructOutput>;
}

export interface PathFinderOpenStrategyResult {
  balances: Record<string, bigint>;
  calls: Array<MultiCallStructOutput>;
}

export interface PathFinderCloseResult {
  underlyingBalance: bigint;
  calls: Array<MultiCallStructOutput>;
}
