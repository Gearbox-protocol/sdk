import type { Address } from "viem";
import {
  type Asset,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
} from "../../../sdk/index.js";
import { PriceUtils } from "../priceMath.js";
import type { QuotaInfoSlice, TokenDataSlice } from "./types.js";

export interface CalcOverallAPYProps {
  caAssets: Array<Asset>;
  lpAPY: Record<Address, number> | undefined;

  quotas: Record<Address, Asset>;
  quotaRates: Record<Address, QuotaInfoSlice>;
  feeInterest: number;

  prices: Record<Address, bigint>;

  totalValue: bigint | undefined;
  debt: bigint | undefined;
  baseRateWithFee: number;
  underlyingToken: Address;
  tokensList: Record<Address, TokenDataSlice>;
}

/**
 * Computes net portfolio APY for a credit account.
 *
 * The resulting value combines:
 * - positive LP yield from supplied assets
 * - negative quota borrowing cost (with interest fee)
 * - negative base debt borrowing cost
 * and normalizes by user-owned equity (`totalValue - debt`) in underlying value terms.
 *
 * ```
 * [
 * Sum(amount_i * price_i * apy_i - quota_i * quotaPrice * quotaRate_i * (1 + feeInterest)) -
 *  debt * debtPrice * baseRateWithFee
 * ] / (totalValue - debt) * debtPrice
 * ```
 *
 * @param props Credit account assets, rates, prices, debt, and token metadata.
 * @returns APY in percentage-factor scale as `bigint`, or `undefined`
 * when required inputs are missing or invalid.
 */
export function calcOverallAPY({
  caAssets,
  lpAPY,
  prices,
  quotas,
  quotaRates,
  feeInterest,

  totalValue,
  debt,
  baseRateWithFee,
  underlyingToken,
  tokensList,
}: CalcOverallAPYProps): bigint | undefined {
  if (!lpAPY || !totalValue || totalValue <= 0n || !debt || totalValue <= debt)
    return undefined;

  const underlyingTokenDecimals = tokensList[underlyingToken]?.decimals || 18;
  const underlyingPrice = prices[underlyingToken];

  const assetAPYMoney = caAssets.reduce(
    (acc, { token: tokenAddress, balance: amount }) => {
      const apy = lpAPY[tokenAddress] || 0;

      const tokenDecimals = tokensList[tokenAddress]?.decimals || 18;
      const price = prices[tokenAddress] || 0n;

      const money = PriceUtils.calcTotalPrice(price, amount, tokenDecimals);
      const apyMoney = money * BigInt(apy);

      const { rate: quotaAPY = 0n, isActive = false } =
        quotaRates?.[tokenAddress] || {};
      const { balance: quotaBalance = 0n } = quotas[tokenAddress] || {};

      const quotaAmount = isActive ? quotaBalance : 0n;
      const quotaMoney = PriceUtils.calcTotalPrice(
        underlyingPrice || 0n,
        quotaAmount,
        underlyingTokenDecimals,
      );

      const quotaRate =
        (quotaAPY * (BigInt(feeInterest) + PERCENTAGE_FACTOR)) /
        PERCENTAGE_FACTOR;

      const quotaAPYMoney = quotaMoney * quotaRate;

      return acc + apyMoney - quotaAPYMoney;
    },
    0n,
  );

  const debtMoney = PriceUtils.calcTotalPrice(
    underlyingPrice || 0n,
    debt,
    underlyingTokenDecimals,
  );
  const debtAPYMoney = debtMoney * BigInt(baseRateWithFee);

  const yourAssetsMoney = PriceUtils.calcTotalPrice(
    underlyingPrice || PRICE_DECIMALS,
    totalValue - debt,
    underlyingTokenDecimals,
  );

  const apyInPercent = (assetAPYMoney - debtAPYMoney) / yourAssetsMoney;

  return apyInPercent;
}
