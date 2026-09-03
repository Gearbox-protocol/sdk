import type {
  AccountHoldings,
  AccountMetrics,
  Bps,
  InsufficientCollateralError,
} from "../../model/index.js";
import { checkCollateralised } from "./checks/index.js";

/**
 * The factors a caller holds an account to. Omitting a threshold switches its
 * check off — there is no single right one.
 */
export interface HealthFactorThresholds {
  /** Lowest acceptable health factor at main prices, in bps. */
  minHealthFactor?: Bps;
  /** Lowest acceptable health factor at safe prices, in bps. */
  minSafeHealthFactor?: Bps;
  /**
   * The factor the account stands at now. Given, an operation that raises it
   * passes even from under the required factor — the top-ups that rescue a
   * position would otherwise be stopped by the very check meant to protect it.
   */
  currentHealthFactor?: Bps;
}

/**
 * An account's factors, in whichever branch of a routed leg the caller means to
 * be held to: `prepare` reports the outcome the router expects, `preview` the
 * floor its calldata guarantees. The check is indifferent — it weighs the
 * numbers it is handed — and passing them one by one is what makes the choice
 * visible where it is made.
 */
export interface WeighedFactors
  extends Pick<AccountHoldings, "totalDebt">,
    Pick<AccountMetrics, "healthFactor" | "safeHealthFactor"> {}

/**
 * The account against whichever thresholds the caller holds it to, so a parsed
 * transaction and a simulated one are weighed by the same code.
 *
 * A loan-free account is nothing to weigh: the health factor reports its
 * zero-debt sentinel and no threshold applies.
 */
export function checkHealthFactors(
  account: WeighedFactors,
  thresholds: HealthFactorThresholds,
): InsufficientCollateralError[] {
  const { minHealthFactor, minSafeHealthFactor, currentHealthFactor } =
    thresholds;
  if (account.totalDebt.value === 0n) {
    return [];
  }
  return [
    ...(minHealthFactor === undefined
      ? []
      : checkCollateralised({
          healthFactor: account.healthFactor,
          healthFactorThreshold: minHealthFactor,
          safePrices: false,
          improvesFrom: currentHealthFactor,
        })),
    // The safe-price threshold is only weighed when the caller names one: it
    // is what the credit manager holds a call that hands funds over to, and a
    // transaction that hands nothing over is not judged at those prices.
    ...(minSafeHealthFactor === undefined
      ? []
      : checkCollateralised({
          healthFactor: account.safeHealthFactor,
          healthFactorThreshold: minSafeHealthFactor,
          safePrices: true,
        })),
  ];
}
