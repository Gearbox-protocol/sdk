import { decimals } from "../tokens/decimals";
import { tokenSymbolByAddress } from "../tokens/token";
import { PriceUtils } from "../utils/price";
import {
  LEVERAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  WAD,
} from "./constants";
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

  borrowed: bigint;
  underlyingToken: string;

  lpAmount: bigint;
  lpToken: string;
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

  maxAPY(baseAPY: number, maxLeverage: number, borrowAPY: number) {
    return (
      baseAPY +
      ((baseAPY - borrowAPY) * (maxLeverage - Number(LEVERAGE_DECIMALS))) /
        Number(LEVERAGE_DECIMALS)
    );
  }

  static liquidationPrice({
    prices,
    liquidationThresholds,

    borrowed,
    underlyingToken,

    lpAmount,
    lpToken,
  }: LiquidationPriceProps) {
    const underlyingTokenAddressLC = underlyingToken.toLowerCase();
    const underlyingTokenSymbol =
      tokenSymbolByAddress[underlyingTokenAddressLC];
    const underlyingTokenDecimals = decimals[underlyingTokenSymbol];

    const underlyingPrice = prices[underlyingTokenAddressLC] || PRICE_DECIMALS;
    const borrowedMoney = PriceUtils.calcTotalPrice(
      underlyingPrice,
      borrowed,
      underlyingTokenDecimals,
    );

    const lpTokenAddressLC = lpToken.toLowerCase();
    const lpTokenSymbol = tokenSymbolByAddress[lpTokenAddressLC];
    const lpTokenDecimals = decimals[lpTokenSymbol];
    const lpLT = liquidationThresholds[lpTokenAddressLC] || 0n;

    const lpPrice = prices[lpTokenAddressLC] || PRICE_DECIMALS;
    const lpMoney = PriceUtils.calcTotalPrice(
      lpPrice,
      lpAmount,
      lpTokenDecimals,
    );
    const lpLTMoney = (lpMoney * lpLT) / PERCENTAGE_FACTOR;

    if (lpLTMoney > 0) {
      const lqPrice = (borrowedMoney * WAD) / lpLTMoney;
      return lqPrice >= 0 ? lqPrice : 0n;
    }

    return 0n;
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
      if (ltA > ltB) return 1;
      if (ltB > ltA) return -1;
      return 0;
    });

    const [cm = "", lt = 0n] = sorted[0] || [];

    return [lt, cm] as const;
  }
}

type PartialCM = Pick<CreditManagerData, "liquidationThresholds" | "address">;
