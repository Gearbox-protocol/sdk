import { ExcludeArrayProps } from "@gearbox-protocol/sdk-gov";

import { SwapTaskStructOutput } from "../../types/IRouter";
import { MultiCall } from "../core";

export type SwapTaskV1 = ExcludeArrayProps<SwapTaskStructOutput>;

export interface PathFinderV1Result {
  amount: bigint;
  calls: Array<MultiCall>;
}

export interface PathFinderV1OpenStrategyResult {
  balances: Record<string, bigint>;
  calls: Array<MultiCall>;
}

export interface PathFinderV1CloseResult {
  underlyingBalance: bigint;
  calls: Array<MultiCall>;
}
