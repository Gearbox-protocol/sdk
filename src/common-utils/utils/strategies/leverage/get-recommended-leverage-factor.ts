import type { LeverageFactor } from "./get-factor-from-leverage.js";
export function getRecommendedLeverageFactor({
  maxLeverageFactor,
}: {
  maxLeverageFactor: LeverageFactor;
}) {
  const l = BigInt(Math.floor((Number(maxLeverageFactor) * 0.7) / 10)) * 10n;
  return l as LeverageFactor;
}
