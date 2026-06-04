import { type Address, encodeFunctionData, erc20Abi, type Hex } from "viem";

import type { AnyPrerequisiteResult } from "./types.js";

/**
 * A single transaction that satisfies a sender-actionable prerequisite.
 *
 * The shape is intentionally minimal (`to`/`data`/optional `value`) so it maps
 * directly onto wallet send primitives (e.g. viem `sendTransaction`, wagmi
 * `useSendTransaction`/`useWriteContract`). It is deliberately *not* the heavier
 * {@link import("../../sdk/types/transactions.js").RawTx} used for Safe batches.
 *
 * The `kind` mirrors the prerequisite kind it remediates, so consumers can label
 * the action (e.g. "Approve") without re-deriving it.
 */
export interface PrerequisiteAction {
  /** Prerequisite kind this action remediates. */
  kind: "allowance";
  /** Contract the transaction is sent to (the ERC-20 token for allowances). */
  to: Address;
  /** Encoded calldata (e.g. `approve(spender, required)`). */
  data: Hex;
  /** Native value to send; omitted (treated as 0) for ERC-20 approvals. */
  value?: bigint;
}

/**
 * Builds the transaction that resolves an unsatisfied, sender-actionable
 * prerequisite, or returns `null` when the prerequisite cannot be fixed with a
 * single wallet transaction.
 *
 * Currently only `allowance` is actionable: it returns an ERC-20
 * `approve(spender, required)` for the exact required amount. `balance`
 * shortfalls (the user must acquire/free up funds) and errored reads are not
 * actionable and return `null`. New actionable kinds (permits, native unwrap,
 * approve-reset-to-zero for non-standard tokens, ...) should be encoded here so
 * consumers do not have to special-case them.
 *
 * Operates on the serializable {@link AnyPrerequisiteResult} produced by
 * `verifyPrerequisites` (not on {@link import("./Prerequisite.js").Prerequisite}
 * instances), so it works against cached/persisted results.
 *
 * @param result - A verified prerequisite result.
 * @returns The remediation transaction, or `null` if not auto-actionable.
 */
export function preparePrerequisiteAction(
  result: AnyPrerequisiteResult,
): PrerequisiteAction | null {
  if (result.kind === "allowance" && result.satisfied === false) {
    const { token, spender, required } = result.detail;
    return {
      kind: "allowance",
      to: token,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, required],
      }),
    };
  }
  return null;
}

/**
 * Whether a prerequisite result represents something the sender can fix with a
 * single wallet transaction (i.e. {@link preparePrerequisiteAction} returns a
 * transaction for it).
 *
 * Useful for UIs that distinguish "approve to continue" (actionable) from hard
 * blocks like an insufficient balance (not actionable).
 */
export function isActionablePrerequisite(
  result: AnyPrerequisiteResult,
): boolean {
  return preparePrerequisiteAction(result) !== null;
}
