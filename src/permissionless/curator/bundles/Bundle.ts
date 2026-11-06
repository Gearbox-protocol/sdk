import type { Address } from "viem";
import type { MarketActions } from "../actions/types.js";

export type Bundle = {
  name: string; // should be unique
  tokenIn: Address[];
  tokenOut: Address[];
  actions: MarketActions[];
  enabledTokens: number;
  warning: string | undefined;
};
