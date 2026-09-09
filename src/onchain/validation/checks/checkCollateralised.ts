import type { Bps, InsufficientCollateralError } from "../../../model/index.js";
import { insufficientCollateral } from "../../../model/index.js";

export interface CollateralisedArgs {
  healthFactor: Bps | undefined;
  /** The lowest acceptable factor — a factor equal to it passes. */
  healthFactorThreshold: Bps;
  safePrices: boolean;
  /**
   * The factor the account stands at now. Given, an operation that raises it
   * passes even from under the required factor: an account already below is
   * rescued by exactly the top-ups a flat threshold would refuse.
   */
  improvesFrom?: Bps;
}

/**
 * The account against its debt, at whichever threshold the caller holds it to.
 *
 * An unread factor counts as failing: a check that cannot see the number is
 * not evidence that the number is fine.
 */
export function checkCollateralised(
  args: CollateralisedArgs,
): InsufficientCollateralError[] {
  const { healthFactor, healthFactorThreshold, safePrices, improvesFrom } =
    args;
  if (healthFactor === undefined) {
    return [
      insufficientCollateral({
        healthFactor: 0,
        healthFactorThreshold,
        safePrices,
      }),
    ];
  }
  if (
    healthFactor >= healthFactorThreshold ||
    (improvesFrom !== undefined && healthFactor > improvesFrom)
  ) {
    return [];
  }
  return [
    insufficientCollateral({
      healthFactor,
      healthFactorThreshold,
      safePrices,
    }),
  ];
}
