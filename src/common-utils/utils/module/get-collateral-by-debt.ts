import { PERCENTAGE_FACTOR } from "../../../sdk/constants/math.js";
export function getCollateralByDebt(
  debt: bigint,
  lt: bigint, // 1
  targetHF = PERCENTAGE_FACTOR,
) {
  if (lt === 0n) return 0n;
  if (targetHF === lt) return 0n;
  const a = (debt * (targetHF - lt)) / lt;
  return a;
}
