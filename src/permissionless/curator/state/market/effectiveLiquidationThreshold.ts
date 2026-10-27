import type { CollateralToken } from "./types.js";

/** Core's integer-basis-point interpolation, including decreasing ramps. */
export function effectiveLiquidationThreshold(
  token: CollateralToken,
  timestamp: number,
): number | undefined {
  const { rampStart, rampDuration, liquidationThresholdFinal: final } = token;
  if (rampDuration === 0 || timestamp >= rampStart + rampDuration) return final;
  const initial = token.liquidationThresholdInitial;
  if (initial === undefined) return undefined;
  if (timestamp <= rampStart) return initial;
  const elapsed = BigInt(timestamp - rampStart);
  const duration = BigInt(rampDuration);
  // Weighted sum avoids rounding a decreasing delta toward zero.
  return (
    Number(
      (BigInt(Math.round(initial * 100)) * (duration - elapsed) +
        BigInt(Math.round(final * 100)) * elapsed) /
        duration,
    ) / 100
  );
}
