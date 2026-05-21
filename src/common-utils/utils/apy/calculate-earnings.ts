import type { Address } from "viem";
import { PERCENTAGE_FACTOR_1KK } from "../../../sdk/constants/math.js";
import { PriceUtils } from "../../utils/price-math.js";
import type { TokenSlice } from "../strategies/strategy-info/types.js";
export interface CalculateEarningsProps {
  overallAPYBigInt: bigint | undefined | null;
  targetAmount: bigint | undefined;
  targetToken: Address;

  tokensList: Record<Address, TokenSlice>;
  prices: Record<Address, bigint>;
}

export function calculateEarnings({
  overallAPYBigInt,
  targetAmount,
  targetToken,
  tokensList,
  prices,
}: CalculateEarningsProps) {
  if (overallAPYBigInt === undefined || overallAPYBigInt === null)
    return {
      earnings: null,
      earningsUSD: null,
    };
  if (targetAmount === undefined || targetAmount <= 0n)
    return {
      earnings: null,
      earningsUSD: null,
    };

  const earnings = (overallAPYBigInt * targetAmount) / PERCENTAGE_FACTOR_1KK;

  const targetPrice = prices[targetToken] || 0n;
  const targetDecimals = tokensList[targetToken]?.decimals || 18;
  const earningsUSD = PriceUtils.calcTotalPrice(
    targetPrice,
    earnings,
    targetDecimals,
  );

  return {
    earnings,
    earningsUSD,
  };
}
