import { ExcludeArrayProps } from "@gearbox-protocol/sdk-gov";

import {
  MultiCallStructOutput,
  SwapTaskStructOutput,
} from "../types/interfaces/IRouter";

export enum SwapOperation {
  EXACT_INPUT,
  EXACT_INPUT_ALL,
  EXACT_OUTPUT,
}

export type MultiCall = ExcludeArrayProps<MultiCallStructOutput>;
export type SwapTask = ExcludeArrayProps<SwapTaskStructOutput>;

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
