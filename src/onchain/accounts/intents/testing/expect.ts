import type { Address } from "viem";
import { expect } from "vitest";
import type { TokenAmount } from "../../../../model/index.js";
import type { MultiCall } from "../../../index.js";
import type { AccountCalculatorOperation } from "../operations.js";
import type {
  DelayedStartResult,
  IntentPreviewResult,
  OperationState,
} from "../types.js";
import { CREDIT_MANAGER } from "./market.js";
import {
  CA_OP_CALLS,
  MOCK_CLAIM_CALL,
  MOCK_REQUEST_CALL,
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
      case "startDelayedWithdrawal":
        return { ...op, calls: [MOCK_REQUEST_CALL] };
      case "claimDelayedWithdrawal":
        return { ...op, calls: [MOCK_CLAIM_CALL] };
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
    case "startDelayedWithdrawal":
      if (actual.type !== "startDelayedWithdrawal") {
        return;
      }
      expect(actual.token, `op[${index}].token`).toBe(expected.token);
      expect(actual.amountIn, `op[${index}].amountIn`).toBe(expected.amountIn);
      expect(actual.outputs, `op[${index}].outputs`).toEqual(expected.outputs);
      expect(actual.settlement, `op[${index}].settlement`).toBe(
        expected.settlement,
      );
      expect(actual.calls, `op[${index}].calls`).toEqual(
        expectedCalls(expected),
      );
      break;
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
  result: IntentPreviewResult | DelayedStartResult,
  args: {
    totalValue: bigint;
    totalDebt: bigint;
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

  expect(result.state.totalValue.value).toBe(args.totalValue);
  expect(result.state.totalDebt.value).toBe(args.totalDebt);
  // Own funds are reported rather than left to the caller to subtract.
  expect(result.state.netValue.value).toBe(args.totalValue - args.totalDebt);
  // The projection names the market it was walked against, which is what lets
  // `checkSimulation` take nothing but the state.
  expect(result.state.creditManager).toBe(CREDIT_MANAGER);
  expect(result.state.name).toBe("TestCreditManager");
  expectOpsArrayExact(result.operations, args.expectedOps);
  return result.state;
}

/** Asserts the preview failed for a specific reason. */
export function expectPreviewError(
  result: IntentPreviewResult | DelayedStartResult,
  reason: Extract<IntentPreviewResult, { ok: false }>["reason"],
): void {
  expect(result.ok, "preview should fail").toBe(false);
  if (result.ok) {
    return;
  }
  expect(result.reason, "failure reason").toBe(reason);
}

/**
 * What a priced list — holdings or quotas — says the account stands at for
 * `token`. A quota is denominated in the market underlying, so this reads the
 * quota bought *for* `token`, not an amount of it.
 */
export function assetBalance(
  assets: Array<TokenAmount>,
  token: Address,
): bigint {
  return (
    assets.find(a => a.token.address.toLowerCase() === token.toLowerCase())
      ?.value ?? 0n
  );
}
