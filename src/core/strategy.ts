import {
  extractTokenData,
  LEVERAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  WAD,
} from "@gearbox-protocol/sdk-gov";

import { BigIntMath } from "../utils/math";
import { PriceUtils } from "../utils/price";
import { Asset } from "./assets";
import { CreditManagerData } from "./creditManager";

export interface StrategyPayload {
  apy?: number;

  name: string;
  lpToken: string;
  creditManagers: Array<string>;

  baseAssets: Array<string>;
  unleveragableCollateral: Array<string>;
  leveragableCollateral: Array<string>;
}

interface LiquidationPriceProps {
  prices: Record<string, bigint>;
  liquidationThresholds: Record<string, bigint>;

  debt: bigint;
  underlyingToken: string;
  targetToken: string;
  assets: Record<string, Asset>;
}

export class Strategy {
  apy: number | undefined;
  name: string;
  lpToken: string;

  baseAssets: Array<string>;
  unleveragableCollateral: Array<string>;
  leveragableCollateral: Array<string>;

  creditManagers: Array<string>;

  constructor(payload: StrategyPayload) {
    this.apy = payload.apy;

    this.name = payload.name;
    this.lpToken = payload.lpToken.toLowerCase();
    this.creditManagers = payload.creditManagers.map(addr =>
      addr.toLowerCase(),
    );
    this.baseAssets = payload.baseAssets.map(addr => addr.toLowerCase());
    this.unleveragableCollateral = payload.unleveragableCollateral.map(addr =>
      addr.toLowerCase(),
    );
    this.leveragableCollateral = payload.leveragableCollateral.map(addr =>
      addr.toLowerCase(),
    );
  }

  static maxLeverage(lpToken: string, cms: Array<PartialCM>) {
    const [maxThreshold] = Strategy.maxLeverageThreshold(lpToken, cms);

    const maxLeverage =
      (PERCENTAGE_FACTOR * LEVERAGE_DECIMALS) /
      (PERCENTAGE_FACTOR - maxThreshold);
    return Number(maxLeverage - LEVERAGE_DECIMALS);
  }

  static maxAPY(baseAPY: number, maxLeverage: number, borrowAPY: number) {
    return (
      baseAPY +
      ((baseAPY - borrowAPY) * (maxLeverage - Number(LEVERAGE_DECIMALS))) /
        Number(LEVERAGE_DECIMALS)
    );
  }

  static liquidationPrice({
    prices,
    liquidationThresholds,

    debt,
    underlyingToken,
    targetToken,
    assets,
  }: LiquidationPriceProps) {
    const underlyingTokenLC = underlyingToken.toLowerCase();
    const [, underlyingDecimals = 18] = extractTokenData(underlyingTokenLC);
    const { balance: underlyingBalance = 0n } = assets[underlyingTokenLC] || {};

    const underlyingPrice = prices[underlyingTokenLC] || PRICE_DECIMALS;
    const borrowedMoney = PriceUtils.calcTotalPrice(
      underlyingPrice,
      BigIntMath.max(0n, debt - underlyingBalance),
      underlyingDecimals,
    );

    const targetTokenLC = targetToken.toLowerCase();
    const [, targetDecimals = 18] = extractTokenData(targetTokenLC);
    const { balance: targetBalance = 0n } = assets[targetTokenLC] || {};
    const lpLT = liquidationThresholds[targetTokenLC] || 0n;

    const lpPrice = prices[targetTokenLC] || PRICE_DECIMALS;
    const lpMoney = PriceUtils.calcTotalPrice(
      lpPrice,
      targetBalance,
      targetDecimals,
    );
    const lpLTMoney = (lpMoney * lpLT) / PERCENTAGE_FACTOR;

    return lpLTMoney > 0n ? (borrowedMoney * WAD) / lpLTMoney : 0n;
  }

  protected static maxLeverageThreshold(
    lpToken: string,
    cms: Array<PartialCM>,
  ) {
    const lpTokenLC = lpToken.toLowerCase();
    const ltByCM: Array<[string, bigint]> = cms.map(cm => {
      const lt = cm.liquidationThresholds[lpTokenLC] || 0n;
      return [cm.address, lt];
    });

    const sorted = ltByCM.sort(([, ltA], [, ltB]) => {
      if (ltA > ltB) return -1;
      if (ltB > ltA) return 1;
      return 0;
    });

    const [cm = "", lt = 0n] = sorted[0] || [];

    return [lt, cm] as const;
  }
}

type PartialCM = Pick<CreditManagerData, "liquidationThresholds" | "address">;
