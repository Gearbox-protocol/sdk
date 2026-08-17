import type { Address } from "viem";
import type { calcQuotaUpdate } from "../../../common-utils/utils/creditAccount/quota-utils.js";
import type {
  Asset,
  ClaimableWithdrawal,
  MultiCall,
  OnchainSDK,
  RequestableWithdrawal,
  RouterCASlice,
  WithdrawalOutput,
} from "../../index.js";
import type { EncodableCreditAccountOperation } from "../types.js";
import type { CreditAccountSlice } from "./types.js";
import { eq } from "./utils/common.js";

/**
 * The operation vocabulary: one logical step of an intent, carrying both the
 * calldata that realises it and the amounts it was computed from.
 *
 * A superset of {@link EncodableCreditAccountOperation}: same discriminants,
 * plus the quoted amounts the preview and the tests read, plus the composite
 * steps (close, repay, start / claim delayed withdrawal) that come from their
 * own assemblers rather than from `assembleCaOperations`.
 */
export type AccountCalculatorOperation =
  | AddCollateralOperation
  | IncreaseDebtOperation
  | DecreaseDebtOperation
  | SwapOperation
  | WithdrawCollateralOperation
  | QuotaUpdateOperation
  | CloseCreditAccountOperation
  | RepayCreditAccountOperation
  | WrapRwaCollateralOperation
  | UnwrapRwaCollateralOperation
  | StartDelayedWithdrawalOperation
  | ClaimDelayedWithdrawalOperation;

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
// RWA wrap / unwrap — 1:1, decimals rescale only
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

// ---------------------------------------------------------------------------
// Composites with their own assemblers
// ---------------------------------------------------------------------------

export interface CloseCreditAccountOperation {
  type: "closeCreditAccount";
  /** Underlying the account holds once every balance is converted. */
  underlyingBalance: bigint;
  /** Expected proceeds of the conversion. */
  amount: bigint;
  /** Floor proceeds after slippage. */
  minAmount: bigint;
  calls: MultiCall[];
}

export async function buildCloseCreditAccountOperation(input: {
  leg: { amount: bigint; minAmount: bigint; calls: MultiCall[] };
  underlyingBalance: bigint;
  to: Address;
  creditAccount: RouterCASlice;
  sdk: OnchainSDK;
}): Promise<CloseCreditAccountOperation> {
  const { leg, creditAccount, sdk } = input;
  const rwaConfig = sdk.tokensMeta.rwaUnderlyings.get(creditAccount.underlying);
  return {
    type: "closeCreditAccount",
    underlyingBalance: input.underlyingBalance,
    amount: leg.amount,
    minAmount: leg.minAmount,
    calls: await sdk.accounts.assembleCloseCreditAccountCalls({
      creditAccount,
      routerCalls: leg.calls,
      assetsToWithdraw: [
        (rwaConfig?.asset ?? creditAccount.underlying).toLowerCase() as Address,
      ],
      to: input.to,
    }),
  };
}

/** Full repay; kept in the vocabulary for callers that assemble it themselves. */
export interface RepayCreditAccountOperation {
  type: "repayCreditAccount";
  expectedRepayAsset?: Asset[];
  expectedWithdrawAssets?: Asset[];
  value?: bigint;
  calls: MultiCall[];
}

export interface StartDelayedWithdrawalOperation {
  type: "startDelayedWithdrawal";
  token: RequestableWithdrawal["token"];
  amountIn: bigint;
  outputs: RequestableWithdrawal["outputs"];
  settlement: "instant" | "delayed";
  calls: MultiCall[];
}

/**
 * The claim of a matured delayed withdrawal: burns the phantom and credits the
 * outputs the compressor reports.
 */
export type ClaimDelayedWithdrawalOperation = {
  type: "claimDelayedWithdrawal";
  /** Source token the delayed withdrawal was requested from. */
  token: Address;
  withdrawalPhantomToken: Address;
  withdrawalTokenSpent: bigint;
  /** Claim outputs as returned by the compressor (incl. `isDelayed`). */
  outputs: WithdrawalOutput[];
  /** Compressor claimCalls. */
  calls: MultiCall[];
};

export function buildClaimDelayedWithdrawalOperation(input: {
  claimable: ClaimableWithdrawal;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): ClaimDelayedWithdrawalOperation {
  const { claimable } = input;
  return {
    type: "claimDelayedWithdrawal",
    token: claimable.token.toLowerCase() as Address,
    withdrawalPhantomToken:
      claimable.withdrawalPhantomToken.toLowerCase() as Address,
    withdrawalTokenSpent: claimable.withdrawalTokenSpent,
    outputs: claimable.outputs.map(o => ({
      ...o,
      token: o.token.toLowerCase() as Address,
    })),
    calls: input.sdk.accounts.assembleClaimDelayedCalls({
      creditFacade: input.creditAccount.creditFacade,
      claimableNow: claimable,
    }),
  };
}

/** First positive non-delayed output (optionally restricted to `token`). */
export function primaryInstantOutput(
  outputs: Array<{ token: Address; amount: bigint; isDelayed: boolean }>,
  token?: Address,
): { token: Address; amount: bigint } | undefined {
  for (const out of outputs) {
    if (out.isDelayed || out.amount <= 0n) {
      continue;
    }
    if (token != null && !eq(out.token, token)) {
      continue;
    }
    return { token: out.token, amount: out.amount };
  }
  return undefined;
}
