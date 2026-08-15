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

/** One routed leg, with the amounts it was quoted at. */
export function buildSwapOperation(input: {
  tokenIn: Address;
  amountIn: bigint;
  tokenOut: Address;
  amountOut: bigint;
  calls: MultiCall[];
}): SwapOperation {
  if (input.calls.length === 0) {
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
