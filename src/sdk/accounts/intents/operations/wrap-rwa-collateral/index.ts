import type { Address } from "viem";
import type { MultiCall, OnchainSDK } from "../../../../index.js";
import type { CreditAccountSlice } from "../../types.js";

export interface WrapRwaCollateralOperation {
  type: "wrapRwaCollateral";
  /** Amount of RWA asset deposited / wrapped. */
  amount: bigint;
  /** RWA asset token (wallet / wrap source). */
  tokenIn: Address;
  /** Underlying received after wrap. */
  tokenOut: Address;
  /** Underlying amount after wrap (1:1, decimals rescale only). */
  amountOut: bigint;
  calls: MultiCall[];
}

/** Wraps an RWA asset into the market underlying. */
export async function buildWrapRwaCollateralOperation(input: {
  tokenIn: Address;
  amountIn: bigint;
  tokenOut: Address;
  amountOut: bigint;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): Promise<WrapRwaCollateralOperation> {
  const calls = await input.sdk.accounts.assembleRWAWrapCalls(
    input.amountIn,
    input.creditAccount.creditManager,
  );
  if (!calls) {
    throw new Error("wrapRwaCollateral: no wrap calls found");
  }

  return {
    type: "wrapRwaCollateral",
    tokenIn: input.tokenIn,
    amount: input.amountIn,
    tokenOut: input.tokenOut,
    amountOut: input.amountOut,
    calls,
  };
}
