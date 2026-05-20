import type { LeverageFactor } from "@gearbox-protocol/sdk/common-utils";

export function getRecommendedLeverageFactor({
  maxLeverageFactor,
}: {
  maxLeverageFactor: LeverageFactor;
}) {
  const l = BigInt(Math.floor((Number(maxLeverageFactor) * 0.7) / 10)) * 10n;
  return l as LeverageFactor;
}
