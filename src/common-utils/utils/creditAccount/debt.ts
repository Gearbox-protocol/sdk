import type { Address } from "viem";
import {
  type Asset,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS_POW,
  WAD_DECIMALS_POW,
} from "../../../sdk/index.js";
import { BigIntMath } from "../bigintMath.js";
import { PriceUtils } from "../priceMath.js";
import type { TokenDataSlice } from "./types.js";

export interface CalcMaxLendingDebtProps {
  assets: Array<Asset>;

  prices: Record<Address, bigint>;
  liquidationThresholds: Record<Address, bigint>;
  underlyingToken: Address;
  tokensList: Record<Address, TokenDataSlice>;

  targetHF?: bigint;
}

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
