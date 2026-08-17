import type { Address } from "viem";
import type { calcQuotaUpdate } from "../../../common-utils/utils/creditAccount/quota-utils.js";
import type { Asset, MultiCall, OnchainSDK } from "../../index.js";
import type { EncodableCreditAccountOperation } from "../types.js";
import type { CreditAccountSlice } from "./types.js";

/**
 * The operation vocabulary: one logical step of an intent, carrying both the
 * calldata that realises it and the amounts it was computed from.
 *
 * A superset of {@link EncodableCreditAccountOperation}: same discriminants,
 * plus the quoted amounts the preview and the tests read, plus the RWA legs
 * that come from their own assemblers rather than from `assembleCaOperations`.
 */
export type AccountCalculatorOperation =
  | AddCollateralOperation
  | IncreaseDebtOperation
  | DecreaseDebtOperation
  | SwapOperation
  | WithdrawCollateralOperation
  | QuotaUpdateOperation
  | WrapRwaCollateralOperation
  | UnwrapRwaCollateralOperation;

/**
 * Compile-time proof that the engine's operations really are the SDK's own
 * encodable ones with the quoted amounts attached, so the two cannot drift into
 * parallel vocabularies for the same facade calls.
 */
type Extends<A extends B, B> = A;
export type _EngineOpsAreEncodable = Extends<
  Extract<
    AccountCalculatorOperation,
    { type: EncodableCreditAccountOperation["type"] }
  >,
  EncodableCreditAccountOperation
>;

// ---------------------------------------------------------------------------
// Facade primitives
// ---------------------------------------------------------------------------

export interface AddCollateralOperation {
  type: "addCollateral";
  token: Address;
  amount: bigint;
  value?: bigint;
  calls: MultiCall[];
}

export function buildAddCollateralOperation(input: {
  token: Address;
  amount: bigint;
  value?: bigint;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): AddCollateralOperation {
  return {
    type: "addCollateral",
    token: input.token,
    amount: input.amount,
    value: input.value,
    calls: input.sdk.accounts.prepareAddCollateral(
      input.creditAccount.creditFacade,
      [{ token: input.token, balance: input.amount }],
      {},
    ),
  };
}

export interface IncreaseDebtOperation {
  type: "increaseDebt";
  amount: bigint;
  calls: MultiCall[];
}

export function buildIncreaseDebtOperation(input: {
  amount: bigint;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): IncreaseDebtOperation {
  return {
    type: "increaseDebt",
    amount: input.amount,
    calls: [
      input.sdk.accounts.prepareIncreaseDebt(
        input.creditAccount.creditFacade,
        input.amount,
      ),
    ],
  };
}

export interface DecreaseDebtOperation {
  type: "decreaseDebt";
  amount: bigint;
  calls: MultiCall[];
}

export function buildDecreaseDebtOperation(input: {
  amount: bigint;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): DecreaseDebtOperation {
  return {
    type: "decreaseDebt",
    amount: input.amount,
    calls: [
      input.sdk.accounts.prepareChangeDebt(
        input.creditAccount.creditFacade,
        input.amount,
        true,
      ),
    ],
  };
}

export interface WithdrawCollateralOperation {
  type: "withdrawCollateral";
  token: Address;
  amount: bigint;
  /** Wallet recipient for withdrawn tokens — never a token address. */
  to: Address;
  calls: MultiCall[];
}

export function buildWithdrawCollateralOperation(input: {
  token: Address;
  amount: bigint;
  to: Address;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): WithdrawCollateralOperation {
  return {
    type: "withdrawCollateral",
    token: input.token,
    amount: input.amount,
    to: input.to,
    calls: [
      input.sdk.accounts.prepareWithdrawToken(
        input.creditAccount.creditFacade,
        input.token,
        input.amount,
        input.to,
      ),
    ],
  };
}

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

export interface QuotaUpdateOperation {
  type: "changeQuota";
  desiredQuota: Record<Address, Asset>;
  quotaIncrease: Asset[];
  quotaDecrease: Asset[];
  calls: MultiCall[];
}

export type QuotaUpdateState = ReturnType<typeof calcQuotaUpdate>;

export function buildQuotaUpdateOperation(input: {
  update: QuotaUpdateState;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): QuotaUpdateOperation {
  const { update, creditAccount, sdk } = input;
  const quotaAssets = [...update.quotaIncrease, ...update.quotaDecrease];
  const calls: MultiCall[] =
    quotaAssets.length === 0
      ? []
      : sdk.accounts.prepareUpdateQuotas(creditAccount.creditFacade, {
          averageQuota: quotaAssets,
          minQuota: quotaAssets,
        });
  return {
    type: "changeQuota",
    desiredQuota: update.desiredQuota,
    quotaIncrease: update.quotaIncrease,
    quotaDecrease: update.quotaDecrease,
    calls,
  };
}

// ---------------------------------------------------------------------------
// RWA wrap / unwrap — 1:1, decimals rescale only, own assemblers
// ---------------------------------------------------------------------------

export interface WrapRwaCollateralOperation {
  type: "wrapRwaCollateral";
  /** Amount of RWA asset wrapped. */
  amount: bigint;
  /** RWA asset token (wrap source). */
  tokenIn: Address;
  /** Underlying received after wrap. */
  tokenOut: Address;
  amountOut: bigint;
  calls: MultiCall[];
}

export interface UnwrapRwaCollateralOperation {
  type: "unwrapRwaCollateral";
  /** Amount of wrapped underlying unwrapped. */
  amount: bigint;
  /** Wrapped underlying token (unwrap source). */
  tokenIn: Address;
  /** RWA asset received after unwrap. */
  tokenOut: Address;
  amountOut: bigint;
  calls: MultiCall[];
}

export interface RwaLegInput {
  tokenIn: Address;
  amountIn: bigint;
  tokenOut: Address;
  amountOut: bigint;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}

/** Wraps an RWA asset into the market underlying. */
export async function buildWrapRwaCollateralOperation(
  input: RwaLegInput,
): Promise<WrapRwaCollateralOperation> {
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

/** Unwraps the market underlying back into its RWA asset. */
export async function buildUnwrapRwaCollateralOperation(
  input: RwaLegInput,
): Promise<UnwrapRwaCollateralOperation> {
  const calls = await input.sdk.accounts.assembleRWAUnwrapCalls(
    input.amountIn,
    input.creditAccount.creditManager,
  );
  if (!calls) {
    throw new Error("unwrapRwaCollateral: no unwrap calls found");
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
