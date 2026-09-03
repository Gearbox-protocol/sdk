import type { Address } from "viem";
import { insufficientBalance } from "../../../model/index.js";
import { LEVERAGE_DECIMALS } from "../../constants/math.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { BigIntMath } from "../../utils/bigint-math.js";
import {
  checkDebtLimits,
  checkLeverage,
  raise,
  toToken,
} from "../../validation/index.js";
import { IntentPreviewError } from "../../validation/raise.js";

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

/** Facade `debtLimits`: a non-zero debt must sit in `[minDebt, maxDebt]`. */
export interface DebtLimits {
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
      insufficientBalance(),
      "cannot preserve leverage on an account with no collateral",
    );
  }
  return (position.debt * collateralDelta) / position.collateral;
}

/**
 * Largest withdrawal (in underlying) that {@link proportionalDebt} can still
 * pay for: the repayment it implies leaves debt at or above `minDebt`, and
 * strictly less than the collateral goes — the last unit closes the account
 * rather than shrinks it. `0n` when the debt already sits below `minDebt`.
 *
 * Solves `floor(D0 · W / C0) ≤ D0 − minDebt` for `W`.
 */
export function maxProportionalWithdrawal(
  position: Position,
  debtLimits: DebtLimits,
): bigint {
  const { debt, collateral } = position;
  if (collateral <= 0n) {
    return 0n;
  }
  const allButLast = collateral - 1n;
  if (debt === 0n) {
    return allButLast;
  }
  const repayable = debt - debtLimits.minDebt;
  if (repayable < 0n) {
    return 0n;
  }
  // floor(D0·W/C0) ≤ R  ⟺  W < C0·(R + 1)/D0
  const bound = BigIntMath.ceilDiv(collateral * (repayable + 1n), debt) - 1n;
  return bound < allButLast ? bound : allButLast;
}

/** Total leverage cannot drop below 1x — that would be negative debt. */
export function assertLeverageAtLeastOne(leverage: bigint): void {
  raise(
    checkLeverage({ leverage, min: LEVERAGE_DECIMALS }),
    `target leverage ${leverage} is below 1x`,
  );
}

/**
 * Rejects a debt the facade would revert on: zero is always fine (no loan at
 * all), anything else has to sit inside `[minDebt, maxDebt]`.
 */
export function assertDebtLimits(
  sdk: OnchainSDK,
  debt: bigint,
  debtLimits: DebtLimits,
  underlying: Address,
): void {
  // An account being adjusted may end owing nothing; the facade only weighs a
  // loan that exists.
  raise(
    checkDebtLimits({
      debt,
      minDebt: debtLimits.minDebt,
      maxDebt: debtLimits.maxDebt,
      underlying: toToken(sdk, underlying),
      allowZero: true,
    }),
    debt > debtLimits.maxDebt
      ? `debt ${debt} exceeds maxDebt ${debtLimits.maxDebt}`
      : `debt ${debt} is below minDebt ${debtLimits.minDebt}`,
  );
}
