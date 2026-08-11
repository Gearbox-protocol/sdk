import type { Address } from "viem";
import type { Asset, MultiCall } from "../../../../index.js";

/** Single-in swap (one token in, one token out). */
export interface SwapOperation {
  type: "swap";
  from: [Asset];
  tokenOut: Address;
  amountOut: bigint;
  calls: MultiCall[];
}

/** One-to-one swap op (withdraw resume conversion legs). */
export function buildSwapOperation(input: {
  tokenIn: Address;
  amountIn: bigint;
  tokenOut: Address;
  amountOut: bigint;
  calls: MultiCall[];
}): SwapOperation {
  return {
    type: "swap",
    from: [{ token: input.tokenIn, balance: input.amountIn }],
    tokenOut: input.tokenOut,
    amountOut: input.amountOut,
    calls: input.calls,
  };
}
