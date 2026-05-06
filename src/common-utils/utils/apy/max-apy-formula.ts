import { LEVERAGE_DECIMALS } from "../../../sdk/index.js";

import { getFactorFromLeverage } from "../strategies/leverage/index.js";

// [apy - quotaRate * (1 + feeInterest)] +
// [
//  apy - baseRateWithFee - quotaRate * (1 + feeInterest)
// ] * (leverage - 1)
export function maxAPYFormula({
  apy,
  leverage,
  baseRateWithFee,
  quotaRateWithFee,
}: {
  apy: number;
  leverage: bigint;
  baseRateWithFee: number;
  quotaRateWithFee: number;
}): number {
  const collateralTerm = apy - quotaRateWithFee;
  const leverageFactor = getFactorFromLeverage(leverage);
  const debtTerm =
    ((apy - baseRateWithFee - quotaRateWithFee) * Number(leverageFactor)) /
    Number(LEVERAGE_DECIMALS);

  return collateralTerm + Math.floor(debtTerm);
}
