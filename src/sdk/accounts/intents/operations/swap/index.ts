import type { Address } from "viem";
import type { Asset, MultiCall, OnchainSDK } from "../../../../index.js";
import type { CreditAccountSlice } from "../../types.js";
import type { OperationBuilderOption } from "../types.js";

/** Single-in swap (one token in, one token out). */
export interface SwapOperation {
  type: "swap";
  from: [Asset];
  tokenOut: Address;
  amountOut: bigint;
  calls: MultiCall[];
}

/** One-to-one swap op (withdraw resume conversion legs). */
export function buildSwapOperation(
  input: {
    tokenIn: Address;
    amountIn: bigint;
    tokenOut: Address;
    amountOut: bigint;
    calls: MultiCall[];
    creditAccount: CreditAccountSlice;
    sdk: OnchainSDK;
  },
  option: OperationBuilderOption,
): SwapOperation {
  if (option.kind === "onchain" && input.calls.length === 0) {
    throw new Error("swap: missing router calls");
  }
  return {
    type: "swap",
    from: [{ token: input.tokenIn, balance: input.amountIn }],
    tokenOut: input.tokenOut,
    amountOut: input.amountOut,
    calls: input.calls,
  };
}
