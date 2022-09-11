import { BigNumber } from "ethers";

export enum SwapOperation {
  EXACT_INPUT,
  EXACT_INPUT_ALL,
  EXACT_OUTPUT,
}

export interface MultiCall {
  target: string;
  callData: string;
}

export interface PathFinderResult {
  amount: BigNumber;
  calls: Array<MultiCall>;
}

export interface PathFinderOpenStrategyResult {
  balances: Record<string, BigNumber>;
  calls: Array<MultiCall>;
}

export interface PathFinderCloseResult {
  underlyingBalance: BigNumber;
  calls: Array<MultiCall>;
}
