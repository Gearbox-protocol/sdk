import type { Address } from "viem";

import type { MultiCall } from "../types";

export type SwapOperation = "EXACT_INPUT" | "EXACT_INPUT_ALL" | "EXACT_OUTPUT";

export interface PathOption {
  target: Address;
  option: number;
  totalOptions: number;
}

export type PathOptionSerie = PathOption[];

export interface SwapTask {
  swapOperation: number;
  creditAccount: Address;
  tokenIn: Address;
  tokenOut: Address;
  connectors: Address[];
  amount: bigint;
  leftoverAmount: bigint;
}

export interface RouterResult {
  amount: bigint;
  minAmount: bigint;
  calls: readonly MultiCall[];
}

export interface OpenStrategyResult extends RouterResult {
  balances: Record<Address, bigint>;
  minBalances: Record<Address, bigint>;
}

export interface RouterCloseResult extends RouterResult {
  underlyingBalance: bigint;
}

export interface CurvePoolStruct {
  curvePool: Address;
  metapoolBase: Address;
}

export interface Asset {
  token: Address;
  balance: bigint;
}
