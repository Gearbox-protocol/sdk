const LOWER_BOUND_FACTOR = 999n;

/** A lower bound that has to move, see {@link nextLowerBound}. */
export interface LowerBoundUpdate {
  lowerBound: bigint;
  /**
   * How far the value sits above the current bound, as a fraction of the
   * bound. Negative once the value fell under it.
   **/
  deviationFromValue: number;
}

/**
 * Where a feed's lower bound should move to under `value`, when the value has
 * outgrown the bound or drifted far enough from it to be worth a transaction.
 * Returns nothing when the bound still fits.
 **/
export function nextLowerBound(
  value: bigint,
  currentLowerBound: bigint,
): LowerBoundUpdate | undefined {
  const lowerBound = (value * LOWER_BOUND_FACTOR) / 1000n;

  const deviationFromValue =
    Math.floor(
      Number((10_000n * (value - currentLowerBound)) / currentLowerBound),
    ) / 10_000;

  const deviationFromBound =
    Math.floor(
      Number((10_000n * (lowerBound - currentLowerBound)) / currentLowerBound),
    ) / 10_000;

  if (deviationFromValue < 0 || Math.abs(deviationFromBound) > 0.005) {
    return { lowerBound, deviationFromValue };
  }
  return undefined;
}
