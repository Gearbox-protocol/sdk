import type { Address } from "viem";
import {
  type Asset,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS_POW,
  WAD_DECIMALS_POW,
} from "../../../sdk/index.js";
import { BigIntMath } from "../bigint-math.js";
import { PriceUtils } from "../price-math.js";
import type { TokenDataSlice } from "./types.js";

export interface CalcMaxLendingDebtProps {
  assets: Array<Asset>;

  prices: Record<Address, bigint>;
  liquidationThresholds: Record<Address, bigint>;
  underlyingToken: Address;
  tokensList: Record<Address, TokenDataSlice>;

  targetHF?: bigint;
}

/**
 * Calculates additional debt that can be borrowed while targeting
 * a minimum health factor after the borrow.
 *
 * The derivation comes from the post-borrow HF equation and clamps
 * negative results to zero.
 *
 * @param healthFactor Current health factor in percentage-factor units.
 * @param debt Current debt amount.
 * @param underlyingLT Liquidation threshold of underlying token.
 * @param minHf Target minimum health factor (defaults to `PERCENTAGE_FACTOR`).
 * @returns Maximum non-negative debt increase.
 */
export function calcMaxDebtIncrease(
  healthFactor: number,
  debt: bigint,
  underlyingLT: number,
  minHf = Number(PERCENTAGE_FACTOR),
): bigint {
  // HF = (TWV + d*lt) / (D + d) => d = (HF*D - TWV) / (l - HF)
  // hf = TWV / D
  // HF = (TVW * D / D + d*lt) / (D + d) = (hf*D + d*lt) / (d + D) => d = D * (hf-HF) / (HF - lt)
  const result =
    (debt * BigInt(healthFactor - minHf)) / BigInt(minHf - underlyingLT);

  return BigIntMath.max(0n, result);
}

/**
 * Calculates maximum debt capacity for lending based on collateral mix.
 *
 * It computes liquidation-threshold-weighted collateral value and converts
 * it into underlying-token debt units at the requested target health factor.
 *
 * @param props Asset balances, prices, thresholds, target HF, and token metadata.
 * @returns Maximum borrowable debt amount in underlying token units.
 */
export function calcMaxLendingDebt({
  assets,

  liquidationThresholds,
  underlyingToken,

  prices,
  tokensList,

  targetHF = PERCENTAGE_FACTOR,
}: CalcMaxLendingDebtProps) {
  const assetsLTMoney = assets.reduce(
    (acc, { token: tokenAddress, balance: amount }) => {
      const tokenDecimals = tokensList[tokenAddress]?.decimals || 18;
      const lt = liquidationThresholds[tokenAddress] || 0n;
      const price = prices[tokenAddress] || 0n;

      const tokenMoney = PriceUtils.calcTotalPrice(
        price,
        amount,
        tokenDecimals,
      );
      const tokenLtMoney = tokenMoney * lt;
      return acc + tokenLtMoney;
    },
    0n,
  );

  const underlyingPrice = prices[underlyingToken] || 0n;
  const underlyingDecimals = tokensList[underlyingToken]?.decimals || 18;

  // HF = TWV / D => D = TWV / HF; D = amount * price
  // Debt_max = sum(LT_i * Asset_i * price_i) / (price_underlying * HF)
  const max =
    underlyingPrice > 0
      ? (assetsLTMoney * 10n ** BigInt(underlyingDecimals)) /
        underlyingPrice /
        targetHF /
        10n ** BigInt(WAD_DECIMALS_POW - PRICE_DECIMALS_POW)
      : 0n;

  return max;
}
