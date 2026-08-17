import type { Address } from "viem";
import { expect } from "vitest";
import type { MultiCall } from "../../../index.js";
import type { AccountCalculatorOperation } from "../operations.js";
import type { IntentPreviewResult, OperationState } from "../types.js";
import {
  CA_OP_CALLS,
  MOCK_ROUTER_CALL,
  MOCK_RWA_UNWRAP_CALL,
  MOCK_RWA_WRAP_CALL,
} from "./sdk-mock.js";

/**
 * Spec expectation: exact op count + type + tokens + amounts + calls.
 * Shared offchain fixtures may omit `calls` (treated as `[]`); onchain
 * expectations should set sentinel calls via {@link withOnchainOpCalls}.
 */
type CallsOptional<T> = T extends { calls: MultiCall[] }
  ? Omit<T, "calls"> & { calls?: MultiCall[] }
  : T;

export type ExpectedFlowOp = CallsOptional<AccountCalculatorOperation>;

function expectedCalls(expected: ExpectedFlowOp): MultiCall[] {
  return expected.calls ?? [];
}

/**
 * Fills sentinel `calls` for onchain expectations. Shared fixtures keep
 * `calls: []` for offchain; onchain tests map through this helper.
 */
export function withOnchainOpCalls(ops: ExpectedFlowOp[]): ExpectedFlowOp[] {
  return ops.map(op => {
    switch (op.type) {
      case "changeQuota":
        return { ...op, calls: [CA_OP_CALLS.changeQuota] };
      case "addCollateral":
        return { ...op, calls: [CA_OP_CALLS.addCollateral] };
      case "increaseDebt":
        return { ...op, calls: [CA_OP_CALLS.increaseDebt] };
      case "decreaseDebt":
        return { ...op, calls: [CA_OP_CALLS.decreaseDebt] };
      case "withdrawCollateral":
        return { ...op, calls: [CA_OP_CALLS.withdrawCollateral] };
      case "swap":
        return {
          ...op,
          calls: op.calls?.length ? op.calls : [MOCK_ROUTER_CALL],
        };
      case "wrapRwaCollateral":
        return {
          ...op,
          calls: op.calls?.length ? op.calls : [MOCK_RWA_WRAP_CALL],
        };
      case "unwrapRwaCollateral":
        return {
          ...op,
          calls: op.calls?.length ? op.calls : [MOCK_RWA_UNWRAP_CALL],
        };
      default:
        return op;
    }
  });
}

function matchOp(
  actual: AccountCalculatorOperation,
  expected: ExpectedFlowOp,
  index: number,
): void {
  expect(actual.type, `op[${index}].type`).toBe(expected.type);

  switch (expected.type) {
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
      expect(actual.calls, `op[${index}].calls`).toEqual(
        expectedCalls(expected),
      );
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
      expect(actual.calls, `op[${index}].calls`).toEqual(
        expectedCalls(expected),
      );
      break;
    case "decreaseDebt":
      if (actual.type !== "decreaseDebt") {
        return;
      }
      expect(actual.amount, `op[${index}].amount`).toBe(expected.amount);
      expect(actual.calls, `op[${index}].calls`).toEqual(
        expectedCalls(expected),
      );
      break;
    case "increaseDebt":
      if (actual.type !== "increaseDebt") {
        return;
      }
      expect(actual.amount, `op[${index}].amount`).toBe(expected.amount);
      expect(actual.calls, `op[${index}].calls`).toEqual(
        expectedCalls(expected),
      );
      break;
    case "addCollateral":
      if (actual.type !== "addCollateral") {
        return;
      }
      expect(actual.token, `op[${index}].token`).toBe(expected.token);
      expect(actual.amount, `op[${index}].amount`).toBe(expected.amount);
      expect(actual.value, `op[${index}].value`).toBe(expected.value);
      expect(actual.calls, `op[${index}].calls`).toEqual(
        expectedCalls(expected),
      );
      break;
    case "withdrawCollateral":
      if (actual.type !== "withdrawCollateral") {
        return;
      }
      expect(actual.token, `op[${index}].token`).toBe(expected.token);
      expect(actual.amount, `op[${index}].amount`).toBe(expected.amount);
      expect(actual.to, `op[${index}].to`).toBe(expected.to);
      expect(actual.calls, `op[${index}].calls`).toEqual(
        expectedCalls(expected),
      );
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
      expect(actual.calls, `op[${index}].calls`).toEqual(
        expectedCalls(expected),
      );
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
      expect(actual.calls, `op[${index}].calls`).toEqual(
        expectedCalls(expected),
      );
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
 * Asserts a successful preview: ok, exact calls (empty unless `expectedCalls`
 * is provided), post-operation metrics, and exact operations (incl. the
 * trailing changeQuota).
 * Returns the projected state for further asset/quota assertions.
 */
export function expectAdjustPreview(
  result: IntentPreviewResult,
  args: {
    totalValue: bigint;
    accountDebt: bigint;
    expectedOps: ExpectedFlowOp[];
    expectedCalls?: MultiCall[];
  },
): OperationState {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error("expected ok preview");
  }

  if (args.expectedCalls) {
    expectCallsArrayExact(result.calls, args.expectedCalls);
  } else {
    expect(result.calls).toEqual([]);
  }

  expect(result.preview.totalValue).toBe(args.totalValue);
  expect(result.preview.accountDebt).toBe(args.accountDebt);
  expectOpsArrayExact(result.operations, args.expectedOps);
  return result.preview;
}

/** Asserts the preview failed for a specific reason. */
export function expectPreviewError(
  result: IntentPreviewResult,
  reason: Extract<IntentPreviewResult, { ok: false }>["reason"],
): void {
  expect(result.ok, "preview should fail").toBe(false);
  if (result.ok) {
    return;
  }
  expect(result.reason, "failure reason").toBe(reason);
}

export function assetBalance(
  assets: Array<{ token: Address; balance: bigint }>,
  token: Address,
): bigint {
  return assets.find(a => a.token === token)?.balance ?? 0n;
}
