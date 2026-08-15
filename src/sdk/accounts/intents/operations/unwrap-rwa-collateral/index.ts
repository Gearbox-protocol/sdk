import type { Address } from "viem";
import type { MultiCall, OnchainSDK } from "../../../../index.js";
import type { CreditAccountSlice } from "../../types.js";

export interface UnwrapRwaCollateralOperation {
  type: "unwrapRwaCollateral";
  /** Amount of wrapped underlying unwrapped. */
  amount: bigint;
  /** Wrapped underlying token (unwrap source). */
  tokenIn: Address;
  /** RWA asset received after unwrap. */
  tokenOut: Address;
  /** RWA asset amount after unwrap (1:1, decimals rescale only). */
  amountOut: bigint;
  calls: MultiCall[];
}

/** Unwraps the market underlying back into its RWA asset. */
export async function buildUnwrapRwaCollateralOperation(input: {
  tokenIn: Address;
  amountIn: bigint;
  tokenOut: Address;
  amountOut: bigint;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): Promise<UnwrapRwaCollateralOperation> {
  const calls = await input.sdk.accounts.assembleRWAUnwrapCalls(
    input.amountIn,
    input.creditAccount.creditManager,
  );
  if (!calls) {
    throw new Error("unwrapRwaCollateral: no wrap calls found");
  }

  return {
    type: "unwrapRwaCollateral",
    tokenIn: input.tokenIn,
    amount: input.amountIn,
    tokenOut: input.tokenOut,
    amountOut: input.amountOut,
    calls,
  };
}
