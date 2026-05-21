import type { Address } from "viem";
import {
  type Asset,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
} from "../../../sdk/index.js";
import { BigIntMath } from "../bigint-math.js";
import { PriceUtils } from "../price-math.js";
import type { QuotaInfoIsActiveSlice, TokenDataSlice } from "./types.js";

export interface CalcHealthFactorProps {
  assets: Array<Asset>;
  quotas: Record<Address, Asset>;
  quotasInfo: Record<Address, QuotaInfoIsActiveSlice | undefined>;

  prices: Record<Address, bigint>;
  liquidationThresholds: Record<Address, bigint>;
  underlyingToken: Address;
  debt: bigint;
  tokensList: Record<Address, TokenDataSlice>;
}

const MAX_UINT16 = 65535;

/**
 * Computes account health factor in percentage-factor units.
 *
 * The function evaluates collateral value under liquidation thresholds,
 * applies quota caps for quoted tokens, and compares the resulting
 * liquidation-adjusted collateral against borrowed value.
 *
 * @param props Credit account balances, quotas, prices, thresholds, and debt context.
 * @returns Health factor as a number in `PERCENTAGE_FACTOR` scale,
 * or `65535` when debt is zero.
 */
export function calcHealthFactor({
  assets,
  quotas,
  quotasInfo,

  liquidationThresholds,
  underlyingToken,
  debt,

  prices,
  tokensList,
}: CalcHealthFactorProps): number {
  if (debt === 0n) return MAX_UINT16;

  const underlyingDecimals = tokensList[underlyingToken]?.decimals || 18;
  const underlyingPrice = prices[underlyingToken] || 0n;

  const assetMoney = assets.reduce(
    (acc, { token: tokenAddress, balance: amount }) => {
      const tokenDecimals = tokensList[tokenAddress]?.decimals || 18;

      const lt = liquidationThresholds[tokenAddress] || 0n;
      const price = prices[tokenAddress] || 0n;

      const tokenMoney = PriceUtils.calcTotalPrice(
        price,
        amount,
        tokenDecimals,
      );
      const tokenLtMoney = (tokenMoney * lt) / PERCENTAGE_FACTOR;

      const { isActive = false } = quotasInfo?.[tokenAddress] || {};
      const quota = quotas[tokenAddress];
      const quotaBalance = isActive ? quota?.balance || 0n : 0n;
      const quotaMoney = PriceUtils.calcTotalPrice(
        underlyingPrice,
        quotaBalance,
        underlyingDecimals,
      );

      // if quota is undefined, then it is not a quoted token
      const money = quota
        ? BigIntMath.min(quotaMoney, tokenLtMoney)
        : tokenLtMoney;

      return acc + money;
    },
    0n,
  );

  const borrowedMoney = PriceUtils.calcTotalPrice(
    underlyingPrice || PRICE_DECIMALS,
    debt,
    underlyingDecimals,
  );

  const hfInPercent =
    borrowedMoney > 0n ? (assetMoney * PERCENTAGE_FACTOR) / borrowedMoney : 0n;

  return Number(hfInPercent);
}
