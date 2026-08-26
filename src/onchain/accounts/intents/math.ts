import type { Address } from "viem";
import { LEVERAGE_DECIMALS } from "../../constants/math.js";
import { BigIntMath } from "../../utils/bigint-math.js";
import { IntentPreviewError } from "./refusal.js";

/**
 * The whole arithmetic behind every intent, in underlying units.
 *
 * Notation: `C` collateral (own funds = TVL − debt), `D` debt, `L` total
 * leverage scaled by {@link LEVERAGE_DECIMALS} (300n = 3x), so `TVL = C · L`
 * and `D = C · (L − 1)`.
 */

/** Debt and collateral of an account, both priced in the underlying. */
export interface Position {
  debt: bigint;
  collateral: bigint;
}

/** Facade limits a non-zero debt must respect. */
export interface DebtBand {
  minDebt: bigint;
  maxDebt: bigint;
}

/** Debt that realises `leverage` on `collateral`: `D = C · (L − 1)`. */
export function debtForLeverage(collateral: bigint, leverage: bigint): bigint {
  return (collateral * (leverage - LEVERAGE_DECIMALS)) / LEVERAGE_DECIMALS;
}

/**
 * Debt change that keeps leverage fixed while collateral moves by
 * `collateralDelta`: `dD = D0 · dC / C0`.
 *
 * Computed on the ratio directly rather than by recovering `L` and reapplying
 * it, so no rounding is introduced on the way.
 */
export function proportionalDebt(
  position: Position,
  collateralDelta: bigint,
): bigint {
  if (position.collateral <= 0n) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      // There is no amount to name: the account has nothing to lever at all.
      undefined,
      "cannot preserve leverage on an account with no collateral",
    );
  }
  return (position.debt * collateralDelta) / position.collateral;
}

/**
 * Largest withdrawal (in underlying) that {@link proportionalDebt} can still
 * pay for: the repayment it implies leaves debt at or above `minDebt`, and
 * strictly less than the collateral goes — the last unit closes the account
 * rather than shrinks it. `0n` when the debt already sits below the band.
 *
 * Solves `floor(D0 · W / C0) ≤ D0 − minDebt` for `W`.
 */
export function maxProportionalWithdrawal(
  position: Position,
  band: DebtBand,
): bigint {
  const { debt, collateral } = position;
  if (collateral <= 0n) {
    return 0n;
  }
  const allButLast = collateral - 1n;
  if (debt === 0n) {
    return allButLast;
  }
  const repayable = debt - band.minDebt;
  if (repayable < 0n) {
    return 0n;
  }
  // floor(D0·W/C0) ≤ R  ⟺  W < C0·(R + 1)/D0
  const bound = BigIntMath.ceilDiv(collateral * (repayable + 1n), debt) - 1n;
  return bound < allButLast ? bound : allButLast;
}

/** Total leverage cannot drop below 1x — that would be negative debt. */
export function assertLeverageAtLeastOne(leverage: bigint): void {
  if (leverage < LEVERAGE_DECIMALS) {
    throw new IntentPreviewError(
      "leverageOutOfRange",
      { requested: leverage, min: LEVERAGE_DECIMALS },
      `target leverage ${leverage} is below 1x`,
    );
  }
}

/**
 * Rejects a debt the facade would revert on: zero is always fine (no loan at
 * all), anything else has to sit inside `[minDebt, maxDebt]`.
 */
export function assertDebtInBand(
  debt: bigint,
  band: DebtBand,
  underlying: Address,
): void {
  const detail = {
    requested: { token: underlying, balance: debt },
    minDebt: { token: underlying, balance: band.minDebt },
    maxDebt: { token: underlying, balance: band.maxDebt },
  };
  if (debt > band.maxDebt) {
    throw new IntentPreviewError(
      "debtOutOfRange",
      detail,
      `debt ${debt} exceeds maxDebt ${band.maxDebt}`,
    );
  }
  if (debt > 0n && debt < band.minDebt) {
    throw new IntentPreviewError(
      "debtOutOfRange",
      detail,
      `debt ${debt} is below minDebt ${band.minDebt}`,
    );
  }
}
