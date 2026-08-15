import type { Address } from "viem";
import type {
  Asset,
  DelayedIntent,
  MultiCall,
  RequestableWithdrawal,
  RouterCASlice,
} from "../../index.js";
import type { AccountCalculatorOperation } from "./operations/index.js";

/**
 * Minimal credit-account data needed by resume previews:
 * account address, CM lookup, underlying for conversion, debt, token balances
 * and initial quotas.
 */
export type CreditAccountSlice = Omit<RouterCASlice, "debt"> & {
  /** either base debt or debt plus interest and fees */
  accountDebt: bigint;
};

/** Post-adjust CA metrics. */
export type AdjustState = {
  kind: "adjust";
  /** Account TVL after operation */
  totalValue: bigint;
  /** Account debt after operation */
  accountDebt: bigint;
  /** Account assets after operation */
  assets: Asset[];
  /** Account quotas after operation */
  quotas: Record<Address, Asset>;
};

/** Close state result. */
export type CloseState = {
  kind: "close";
  /** Received amount */
  amount: bigint;
  /** Conservative receive (min branch / pathfinder floor). */
  minAmount: bigint;
  /** Pathfinder underlying on CA after close path; 0n when unknown (instant). */
  underlyingBalance: bigint;
};

export type OperationState = AdjustState | CloseState;

// Delayed types

type DelayedBranchKind = "instantSettle" | "partialSettle" | "delayedSettle";

type DelayedBranchResult = {
  kind: DelayedBranchKind;
  operations: AccountCalculatorOperation[];
  preview: { min: OperationState };
  calls: MultiCall[];
  intent: DelayedIntent;
  request?: RequestableWithdrawal;
};

type DelayedErrorReason = "multipleDelayedWithdrawals" | "withdrawalInProgress";

// Instant types

type InstantBranchResult = {
  operations: AccountCalculatorOperation[];
  preview: { min: OperationState };
  calls: MultiCall[];
};

type InstantErrorReason = "pathNotFound";

// General return types

/** Why a preview could not be produced at all (no branch is viable). */
export type PreviewErrorReason =
  | "unsupportedFieldPair"
  | "debtOutOfRange"
  | "leverageOutOfRange"
  | "multipleDelayedWithdrawals"
  | "unsupportedMixedDelayedWithdrawal"
  | "unsupportedCloseClaimOutput"
  | "insufficientSourceBalance"
  /** Input token is not accepted by the flow (e.g. deposit of a non-underlying). */
  | "unsupportedCollateralToken";

type PreviewErrorResult = {
  ok: false;
  reason: PreviewErrorReason;
};

interface IntentPreviewSuccessResult {
  ok: true;

  instant: InstantBranchResult | undefined;
  instantError: InstantErrorReason | undefined;

  delayedBranch: DelayedBranchResult | undefined;
  delayedError: DelayedErrorReason | undefined;
}

export type IntentPreviewResult =
  | IntentPreviewSuccessResult
  | PreviewErrorResult;
