import type { Address } from "viem";
import type { ClaimableWithdrawal, OnchainSDK } from "../../../../index.js";
import type { DelayedIntent } from "../../../withdrawal-compressor/types.js";
import type { AccountCalculatorOperation } from "../../operations/index.js";
import type { CreditAccountSlice } from "../../types.js";
import type { OperationLedger, RouterPaths } from "../../utils/index.js";

/**
 * What the tail of a delayed intent is built against, once the claim itself has
 * been applied.
 *
 * The tail is a second transaction, so it starts from the state the claim left
 * behind rather than from the state the intent was planned in: `ledger` carries
 * that state forward as each op is appended, and `claimed` is the payout the
 * tail has to work with.
 */
export interface ResumeContext<T extends DelayedIntent = DelayedIntent> {
  intent: T;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
  /** The matured withdrawal being claimed. */
  claimable: ClaimableWithdrawal;
  /**
   * The claim's first positive instant output — what the tail has to spend.
   * Absent when the withdrawal matured into nothing, which only closing can
   * still make sense of.
   */
  claimed: { token: Address; amount: bigint } | undefined;
  paths: RouterPaths;
  ledger: OperationLedger;
  /**
   * Appends operations, advancing the ledger with each, and returns the chain
   * built so far — so a builder's last `push` is also its return value.
   */
  push(...ops: AccountCalculatorOperation[]): AccountCalculatorOperation[];
}

/** The claim payout, for the tails that have nothing to do without one. */
export function claimedOutput(ctx: ResumeContext): {
  token: Address;
  amount: bigint;
} {
  if (!ctx.claimed || ctx.claimed.amount <= 0n) {
    throw new Error("No claimable assets");
  }
  return ctx.claimed;
}
