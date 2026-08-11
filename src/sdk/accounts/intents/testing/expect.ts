import type { Address } from "viem";
import { expect } from "vitest";
import type { MultiCall } from "../../../index.js";

import type {
  AccountCalculatorOperation,
  ClaimDelayedWithdrawalOperation,
  CloseCreditAccountOperation,
  QuotaUpdateOperation,
} from "../operations/index.js";
import type { AdjustState, IntentPreviewResult } from "../types.js";

/**
 * Spec expectation: exact op count + type + tokens + amounts.
 * Ported from intent-calculator `expectOpsExact`, reduced to the op types the
 * resume flows produce. `claimDelayedWithdrawal.claimCalls` is intentionally
 * not compared (call payload is asserted via `result.calls`).
 */
export type ExpectedFlowOp =
  | ClaimDelayedWithdrawalOperation
  | QuotaUpdateOperation
  | CloseCreditAccountOperation
  | Extract<
      AccountCalculatorOperation,
      {
        type:
          | "swap"
          | "decreaseDebt"
          | "withdrawCollateral"
          | "unwrapRwaCollateral"
          | "wrapRwaCollateral";
      }
    >;

function matchOp(
  actual: AccountCalculatorOperation,
  expected: ExpectedFlowOp,
  index: number,
): void {
  expect(actual.type, `op[${index}].type`).toBe(expected.type);

  switch (expected.type) {
    case "claimDelayedWithdrawal":
      if (actual.type !== "claimDelayedWithdrawal") {
        return;
      }
      expect(actual.token, `op[${index}].token`).toBe(expected.token);
      expect(
        actual.withdrawalPhantomToken,
        `op[${index}].withdrawalPhantomToken`,
      ).toBe(expected.withdrawalPhantomToken);
      expect(
        actual.withdrawalTokenSpent,
        `op[${index}].withdrawalTokenSpent`,
      ).toBe(expected.withdrawalTokenSpent);
      expect(actual.outputs, `op[${index}].outputs`).toEqual(expected.outputs);
      break;
    case "changeQuota":
      if (actual.type !== "changeQuota") {
        return;
      }
      expect(actual.quotaIncrease, `op[${index}].quotaIncrease`).toEqual(
        expected.quotaIncrease,
      );
      expect(actual.quotaDecrease, `op[${index}].quotaDecrease`).toEqual(
        expected.quotaDecrease,
      );
      break;
    case "closeCreditAccount":
      if (actual.type !== "closeCreditAccount") {
        return;
      }
      expect(actual.amount, `op[${index}].amount`).toBe(expected.amount);
      expect(actual.minAmount, `op[${index}].minAmount`).toBe(
        expected.minAmount,
      );
      expect(actual.underlyingBalance, `op[${index}].underlyingBalance`).toBe(
        expected.underlyingBalance,
      );
      expect(actual.calls, `op[${index}].routerCalls`).toEqual(expected.calls);
      break;
    case "swap":
      if (actual.type !== "swap") {
        return;
      }
      expect(actual.from, `op[${index}].from`).toEqual(expected.from);
      expect(actual.tokenOut, `op[${index}].tokenOut`).toBe(expected.tokenOut);
      expect(actual.amountOut, `op[${index}].amountOut`).toBe(
        expected.amountOut,
      );
      expect(actual.calls, `op[${index}].calls`).toEqual(expected.calls);
      break;
    case "decreaseDebt":
      if (actual.type !== "decreaseDebt") {
        return;
      }
      expect(actual.amount, `op[${index}].amount`).toBe(expected.amount);
      break;
    case "withdrawCollateral":
      if (actual.type !== "withdrawCollateral") {
        return;
      }
      expect(actual.token, `op[${index}].token`).toBe(expected.token);
      expect(actual.amount, `op[${index}].amount`).toBe(expected.amount);
      expect(actual.to, `op[${index}].to`).toBe(expected.to);
      break;
    case "unwrapRwaCollateral":
      if (actual.type !== "unwrapRwaCollateral") {
        return;
      }
      expect(actual.tokenIn, `op[${index}].tokenIn`).toBe(expected.tokenIn);
      expect(actual.tokenOut, `op[${index}].tokenOut`).toBe(expected.tokenOut);
      expect(actual.amount, `op[${index}].amount`).toBe(expected.amount);
      expect(actual.amountOut, `op[${index}].amountOut`).toBe(
        expected.amountOut,
      );
      expect(actual.calls, `op[${index}].calls`).toEqual(expected.calls);
      break;
    case "wrapRwaCollateral":
      if (actual.type !== "wrapRwaCollateral") {
        return;
      }
      expect(actual.tokenIn, `op[${index}].tokenIn`).toBe(expected.tokenIn);
      expect(actual.tokenOut, `op[${index}].tokenOut`).toBe(expected.tokenOut);
      expect(actual.amount, `op[${index}].amount`).toBe(expected.amount);
      expect(actual.amountOut, `op[${index}].amountOut`).toBe(
        expected.amountOut,
      );
      expect(actual.calls, `op[${index}].calls`).toEqual(expected.calls);
      break;
  }
}

/** Asserts exact operations on a raw op array (type + tokens + amounts). */
export function expectOpsArrayExact(
  ops: AccountCalculatorOperation[],
  expected: ExpectedFlowOp[],
): void {
  expect(ops.length, "operations.length").toBe(expected.length);
  for (let i = 0; i < expected.length; i++) {
    const actual = ops[i];
    const exp = expected[i];
    if (actual === undefined || exp === undefined) {
      expect.fail(`missing op at index ${i}`);
      return;
    }
    matchOp(actual, exp, i);
  }
}

/** Asserts exact calls on a raw MultiCall array (target + callData). */
export function expectCallsArrayExact(
  calls: MultiCall[],
  expected: MultiCall[],
  label = "calls",
): void {
  expect(calls.length, `${label}.length`).toBe(expected.length);
  for (let i = 0; i < expected.length; i++) {
    const actual = calls[i];
    const exp = expected[i];
    if (actual === undefined || exp === undefined) {
      expect.fail(`missing call at index ${i}`);
      return;
    }
    expect(actual.target, `${label}[${i}].target`).toBe(exp.target);
    expect(actual.callData, `${label}[${i}].callData`).toBe(exp.callData);
  }
}

/**
 * Asserts a successful adjust-style resume preview: ok, instant branch present,
 * exact calls (empty unless `expectedCalls` is provided), metrics from the
 * post-claim CA, and exact operations (incl. changeQuota).
 * Returns the adjust preview state for further asset/quota assertions.
 */
export function expectAdjustResumePreview(
  result: IntentPreviewResult,
  args: {
    totalValue: bigint;
    accountDebt: bigint;
    expectedOps: ExpectedFlowOp[];
    expectedCalls?: MultiCall[];
  },
): AdjustState {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error("expected ok resume preview");
  }

  expect(result.instant, "instant branch").toBeDefined();
  if (!result.instant) {
    throw new Error("expected instant branch");
  }

  if (args.expectedCalls) {
    expectCallsArrayExact(result.instant.calls, args.expectedCalls);
  } else {
    expect(result.instant.calls).toEqual([]);
  }

  const state = result.instant.preview.min;
  expect(state.kind).toBe("adjust");
  if (state.kind !== "adjust") {
    throw new Error("expected adjust preview state");
  }

  expect(state.totalValue).toBe(args.totalValue);
  expect(state.accountDebt).toBe(args.accountDebt);
  expectOpsArrayExact(result.instant.operations, args.expectedOps);
  return state;
}

export function assetBalance(
  assets: Array<{ token: Address; balance: bigint }>,
  token: Address,
): bigint {
  return assets.find(a => a.token === token)?.balance ?? 0n;
}
