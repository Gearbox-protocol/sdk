import type { Address } from "viem";
import { MAX_UINT256 } from "../../constants/math.js";
import type { Asset, MultiCall, OnchainSDK } from "../../index.js";
import type { calcQuotaUpdate } from "../quota-utils.js";
import type { EncodableCreditAccountOperation } from "../types.js";
import type {
  ClaimableWithdrawal,
  RequestableWithdrawal,
  WithdrawalOutput,
} from "../withdrawal-compressor/types.js";
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
  /**
   * The repayment settles the loan rather than shrinking it, so the call names
   * no amount and the facade takes everything outstanding. `amount` is still
   * the debt as it was read, which is what the projection is built on; the
   * difference is the interest that accrues before the transaction lands.
   */
  full?: boolean;
  calls: MultiCall[];
}

export function buildDecreaseDebtOperation(input: {
  amount: bigint;
  full?: boolean;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): DecreaseDebtOperation {
  return {
    type: "decreaseDebt",
    amount: input.amount,
    ...(input.full ? { full: true } : {}),
    calls: [
      input.sdk.accounts.prepareChangeDebt(
        input.creditAccount.creditFacade,
        input.full ? MAX_UINT256 : input.amount,
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
  /**
   * The call names no amount and the facade hands over the whole balance, so a
   * swap that beat its floor does not strand the surplus on the account.
   * `amount` remains the figure the projection was built on.
   */
  all?: boolean;
  calls: MultiCall[];
}

export function buildWithdrawCollateralOperation(input: {
  token: Address;
  amount: bigint;
  to: Address;
  all?: boolean;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): WithdrawCollateralOperation {
  return {
    type: "withdrawCollateral",
    token: input.token,
    amount: input.amount,
    to: input.to,
    ...(input.all ? { all: true } : {}),
    calls: [
      input.sdk.accounts.prepareWithdrawToken(
        input.creditAccount.creditFacade,
        input.token,
        input.all ? MAX_UINT256 : input.amount,
        input.to,
      ),
    ],
  };
}

/** Routed conversion: one or more tokens in, one token out. */
export interface SwapOperation {
  type: "swap";
  from: Asset[];
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
  return buildCloseSwapOperation({
    from: [{ token: input.tokenIn, balance: input.amountIn }],
    tokenOut: input.tokenOut,
    amountOut: input.amountOut,
    calls: input.calls,
  });
}

/**
 * The many-to-one leg an exit routes: every balance listed goes in, and the
 * underlying comes out.
 */
export function buildCloseSwapOperation(input: {
  from: Asset[];
  tokenOut: Address;
  amountOut: bigint;
  calls: MultiCall[];
}): SwapOperation {
  if (input.calls.length === 0) {
    throw new Error("swap: missing router calls");
  }
  return {
    type: "swap",
    from: input.from,
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

// ---------------------------------------------------------------------------
// Delayed withdrawals — the two halves of a redemption that spans transactions
// ---------------------------------------------------------------------------

/**
 * The request that starts a redemption: spends the source token and receives
 * the phantom token standing in for the claim until it matures.
 */
export interface StartDelayedWithdrawalOperation {
  type: "startDelayedWithdrawal";
  /** Source token the redemption is requested from. */
  token: Address;
  /** Amount of `token` the issuer burns; capped at the account balance. */
  amountIn: bigint;
  /** Request outputs; a delayed one is the phantom token, not the claim. */
  outputs: WithdrawalOutput[];
  /** Whether anything at all has to be waited for. */
  settlement: "instant" | "delayed";
  calls: MultiCall[];
}

export function buildStartDelayedWithdrawalOperation(input: {
  preview: RequestableWithdrawal;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): StartDelayedWithdrawalOperation {
  const { preview } = input;
  return {
    type: "startDelayedWithdrawal",
    token: preview.token,
    amountIn: preview.amountIn,
    outputs: [...preview.outputs],
    settlement: preview.outputs.some(o => o.isDelayed) ? "delayed" : "instant",
    calls: input.sdk.accounts.assembleStartDelayedWithdrawalCalls({
      creditFacade: input.creditAccount.creditFacade,
      preview,
    }),
  };
}

/**
 * The claim of a matured delayed withdrawal: burns the phantom and credits the
 * outputs the compressor reports.
 */
export interface ClaimDelayedWithdrawalOperation {
  type: "claimDelayedWithdrawal";
  /** Source token the delayed withdrawal was requested from. */
  token: Address;
  withdrawalPhantomToken: Address;
  withdrawalTokenSpent: bigint;
  /** Claim outputs as returned by the compressor (incl. `isDelayed`). */
  outputs: WithdrawalOutput[];
  calls: MultiCall[];
}

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

/**
 * What a request or a claim puts on the account right away, as opposed to what
 * only the phantom token represents.
 */
export function instantOutput(
  outputs: WithdrawalOutput[],
  token?: Address,
): { token: Address; amount: bigint } | undefined {
  for (const out of outputs) {
    if (out.isDelayed || out.amount <= 0n) {
      continue;
    }
    if (token != null && out.token.toLowerCase() !== token.toLowerCase()) {
      continue;
    }
    return { token: out.token, amount: out.amount };
  }
  return undefined;
}
