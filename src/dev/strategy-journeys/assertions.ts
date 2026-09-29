import assert from "node:assert/strict";
import { isAddressEqual } from "viem";
import { ADDRESS_0X0 } from "../../onchain/index.js";
import type { JourneyState, JourneyStep } from "./types.js";

export function near(
  actual: bigint,
  expected: bigint,
  bps: number,
  label: string,
): void {
  const tolerance = (expected * BigInt(bps)) / 10_000n + 2n;
  const delta = actual > expected ? actual - expected : expected - actual;
  assert(
    delta <= tolerance,
    `${label}: expected ${expected} ± ${tolerance}, got ${actual}`,
  );
}

/** Leverage amplifies value slippage quadratically; `floor` absorbs rounding. */
export function leverageNear(
  actual: number,
  expected: number,
  bps: number,
  label: string,
  floor = 0.03,
): void {
  assert(
    Math.abs(actual - expected) <=
      Math.max(floor, (expected ** 2 * bps) / 10_000),
    label,
  );
}

export function unchangedDebt(before: JourneyState, after: JourneyState): void {
  // Public debt includes interest; principal-only operations can accrue between blocks.
  assert(after.debt >= before.debt, "Debt unexpectedly decreased");
  near(after.debt, before.debt, 5, "Debt changed beyond interest tolerance");
}

export function assertJourneyStep(
  step: JourneyStep,
  valueToleranceBps = 100,
): void {
  const { before, after, expected } = step;
  assert(
    step.transactions.length > 0,
    "The action did not submit a transaction",
  );
  near(after.debt, expected.debt, 5, "Debt versus preparation");
  near(
    after.value,
    expected.value,
    valueToleranceBps,
    "Value versus preparation",
  );
  leverageNear(
    after.leverage,
    expected.leverage,
    valueToleranceBps,
    "Leverage differs from preparation",
  );
  if (after.debt > 0n)
    assert(after.healthFactor >= 10_000, "The resulting position is unsafe");
  assert.equal(
    after.pendingWithdrawals,
    0,
    "The action left a withdrawal unfinished",
  );
  // A fresh opening has no prior account to compare with.
  if (!isAddressEqual(before.creditAccount, ADDRESS_0X0))
    assert(
      isAddressEqual(before.creditAccount, after.creditAccount),
      "The operation changed the wrong credit account",
    );
}
