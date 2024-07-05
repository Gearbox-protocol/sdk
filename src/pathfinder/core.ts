import { Address, ExcludeArrayProps } from "@gearbox-protocol/sdk-gov";

import {
  MultiCallStructOutput,
  RouterResultStructOutput,
  SwapTaskStruct,
} from "../types/IRouterV3";

export enum SwapOperation {
  EXACT_INPUT,
  EXACT_INPUT_ALL,
  EXACT_OUTPUT,
}

export type MultiCall = ExcludeArrayProps<MultiCallStructOutput>;
export type SwapTask = ExcludeArrayProps<SwapTaskStruct>;

export type PathFinderResult = Omit<
  ExcludeArrayProps<RouterResultStructOutput>,
  "calls"
> & {
  calls: Array<MultiCall>;
};

export interface PathFinderOpenStrategyResult extends PathFinderResult {
  balances: Record<Address, bigint>;
  minBalances: Record<Address, bigint>;
}

export interface PathFinderCloseResult extends PathFinderResult {
  underlyingBalance: bigint;
}
