import type { Address } from "viem";
import { PriceUtils } from "../../utils/price-math.js";
import { PERCENTAGE_FACTOR_1KK } from "./constants.js";
import type { TokenData } from "./types.js";
export interface CalculateEarningsProps {
  overallAPYBigInt: bigint | undefined | null;
  targetAmount: bigint | undefined;
  targetToken: Address;

  tokensList: Record<Address, TokenData>;
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
