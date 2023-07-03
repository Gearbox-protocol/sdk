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
  amount: bigint;
  calls: Array<MultiCall>;
}

export interface PathFinderOpenStrategyResult {
  balances: Record<string, bigint>;
  calls: Array<MultiCall>;
}

export interface PathFinderCloseResult {
  underlyingBalance: bigint;
  calls: Array<MultiCall>;
}
