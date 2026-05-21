import type { Address } from "viem";
import {
  LEVERAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
} from "../../../../sdk/constants/math.js";
import type { Asset } from "../../../../sdk/router/types.js";
import { BigIntMath } from "../../bigint-math.js";
import { PriceUtils } from "../../price-math.js";
import { getPointsRates } from "../points/get-points-rates.js";
import type {
  LocalDebtReward,
  LocalPointsInfo,
  LocalPointsReward,
} from "../types/points-slices.js";
import type { TokenSlice } from "./types.js";

const THRESHOLD_POINTS = 1000;

export interface PointsData {
  rates: Array<LocalPointsReward["multiplier"]>;
  debtRates: {
    rewards: Array<LocalDebtReward>;
    rates: Array<LocalDebtReward["multiplier"]>;
  };
  info: LocalPointsInfo;
}

export function calculateTotalPoints({
  pointsAsset,
  cmAddress,
  info,
  totalValue,
  assetValue,
  prices,
  tokensList,
  underlyingToken,
}: {
  pointsAsset: Asset | undefined;
  cmAddress: Address;
  info: LocalPointsInfo | undefined;
  totalValue: bigint | undefined;
  assetValue: bigint | undefined;
  prices: Record<Address, bigint>;
  tokensList: Record<Address, TokenSlice>;
  underlyingToken: Address;
}): PointsData | null {
  if (!pointsAsset || !info) return null;
  if (totalValue === undefined || totalValue <= 0n) return null;
  if (assetValue === undefined || assetValue <= 0n) return null;

  const { token: tokenAddress, balance: amount } = pointsAsset;
  const price = prices[tokenAddress] || 0n;
  const tokenDecimals = tokensList[tokenAddress]?.decimals || 18;

  const money = PriceUtils.calcTotalPrice(price, amount, tokenDecimals);

  const underlyingPrice = prices[underlyingToken] ?? PRICE_DECIMALS;
  const { decimals: underlyingDecimals = 18 } =
    tokensList[underlyingToken] || {};

  const assetAmountInUnderlying = PriceUtils.convertByPrice(money, {
    price: underlyingPrice || PRICE_DECIMALS,
    decimals: underlyingDecimals,
  });

  const percent = (assetAmountInUnderlying * PERCENTAGE_FACTOR) / totalValue;
  if (percent < THRESHOLD_POINTS) return null;

  const leverage = (assetAmountInUnderlying * LEVERAGE_DECIMALS) / assetValue;
  const rates = getPointsRates(info.rewards, leverage);

  const debt = totalValue - assetValue;
  const leverageDebt =
    (BigIntMath.min(assetAmountInUnderlying, debt > 0 ? debt : 0n) *
      LEVERAGE_DECIMALS) /
    assetValue;
  const debtRewardsAvailable = (info.debtRewards || []).filter(
    r => r.cm === cmAddress || r.cm === "any",
  );
  const debtRates = getPointsRates(debtRewardsAvailable, leverageDebt);

  return {
    info,
    rates,
    debtRates: {
      rewards: debtRewardsAvailable,
      rates: debtRates,
    },
  };
}
