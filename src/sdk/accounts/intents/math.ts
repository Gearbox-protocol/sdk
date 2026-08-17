import { LEVERAGE_DECIMALS } from "../../constants/math.js";
import { IntentPreviewError } from "./types.js";

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
      "cannot preserve leverage on an account with no collateral",
    );
  }
  return (position.debt * collateralDelta) / position.collateral;
}

/** Total leverage cannot drop below 1x — that would be negative debt. */
export function assertLeverageAtLeastOne(leverage: bigint): void {
  if (leverage < LEVERAGE_DECIMALS) {
    throw new IntentPreviewError(
      "leverageOutOfRange",
      `target leverage ${leverage} is below 1x`,
    );
  }
}

/**
 * Rejects a debt the facade would revert on: zero is always fine (no loan at
 * all), anything else has to sit inside `[minDebt, maxDebt]`.
 */
export function assertDebtInBand(debt: bigint, band: DebtBand): void {
  if (debt > band.maxDebt) {
    throw new IntentPreviewError(
      "debtOutOfRange",
      `debt ${debt} exceeds maxDebt ${band.maxDebt}`,
    );
  }
  if (debt > 0n && debt < band.minDebt) {
    throw new IntentPreviewError(
      "debtOutOfRange",
      `debt ${debt} is below minDebt ${band.minDebt}`,
    );
  }
}
