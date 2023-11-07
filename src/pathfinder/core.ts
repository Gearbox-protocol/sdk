import { ExcludeArrayProps } from "@gearbox-protocol/sdk-gov";

import {
  MultiCallStructOutput,
  RouterResultStructOutput,
  SwapTaskStruct,
} from "../types/interfaces/IRouter";
import { BigintifyProps } from "../utils/types";

export enum SwapOperation {
  EXACT_INPUT,
  EXACT_INPUT_ALL,
  EXACT_OUTPUT,
}

export type MultiCall = ExcludeArrayProps<MultiCallStructOutput>;
export type SwapTask = ExcludeArrayProps<SwapTaskStruct>;

export type PathFinderResult = BigintifyProps<
  ExcludeArrayProps<RouterResultStructOutput>
> & {
  calls: BigintifyProps<ExcludeArrayProps<RouterResultStructOutput["calls"]>>;
};

export interface PathFinderOpenStrategyResult {
  balances: Record<string, bigint>;
  calls: Array<MultiCall>;
}

export interface PathFinderCloseResult {
  underlyingBalance: bigint;
  calls: Array<MultiCall>;
}
