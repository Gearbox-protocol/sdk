import type { Address } from "viem";
import {
  LEVERAGE_DECIMALS,
  PERCENTAGE_FACTOR,
} from "../../../sdk/constants/math.js";
import { BigIntMath } from "../../utils/bigint-math.js";
import { calculateLossCoefficient } from "../../utils/strategies/leverage/calculate-loss-coefficient.js";
import { maxLeverage } from "./max-leverage.js";
import type { CreditManagerData } from "./types.js";

const DEFAULT_DEBT_CONSTANT_LOSS = 1500n;

export interface CalculateMaxDebtProps {
  targetToken: Address;
  amount: bigint;
  creditManager: CreditManagerData;
  slippage: number;
  constantLoss?: bigint;
  swapCollateral?: boolean;
}

export function calculateMaxStrategyDebt({
  targetToken,
  amount,
  creditManager,
  slippage,
  constantLoss = DEFAULT_DEBT_CONSTANT_LOSS,
  swapCollateral = true,
}: CalculateMaxDebtProps) {
  const targetQuota = creditManager.quotas[targetToken];

  // extract collateral quota from available quota if swapCollateral is true
  const quotaLeft =
    swapCollateral && targetQuota
      ? BigIntMath.max(0n, targetQuota.limit - targetQuota.totalQuoted)
      : undefined;
  // if quotaLeft is 0, then there is no available quota, possible amount to borrow is 0
  if (quotaLeft === 0n) {
    return creditManager.minDebt;
  }

  // if quota was used on previous step, select minimum between available quota and available to borrow
  const availableLiquidity =
    quotaLeft !== undefined
      ? BigIntMath.min(quotaLeft, creditManager.availableToBorrow)
      : creditManager.availableToBorrow;
  const coefficient = calculateLossCoefficient(slippage, constantLoss);
  // effective debt is the minimum between available to borrow and max debt
  const effectiveMaxDebt = BigIntMath.max(
    BigIntMath.min(availableLiquidity, creditManager.maxDebt),
    creditManager.minDebt,
  );
  // if collateral was not specified, then return effective max debt
  if (amount === 0n) {
    return effectiveMaxDebt;
  }
  const maxPossibleLeverage = maxLeverage(targetToken, [creditManager]);

  const debt = (amount * BigInt(maxPossibleLeverage)) / LEVERAGE_DECIMALS;
  const effectiveDebt = (debt * coefficient) / PERCENTAGE_FACTOR;

  const result = BigIntMath.max(
    BigIntMath.min(effectiveDebt, effectiveMaxDebt),
    creditManager.minDebt,
  );

  return result;
}
