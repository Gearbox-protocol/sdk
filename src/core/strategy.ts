import { BigNumber } from "ethers";

import { TokensWithAPY } from "../apy";
import { decimals } from "../tokens/decimals";
import { tokenSymbolByAddress } from "../tokens/token";
import { calcTotalPrice } from "../utils/price";
import { Asset } from "./assets";
import {
  LEVERAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  WAD,
} from "./constants";
import { CreditManagerData } from "./creditManager";

export interface StrategyPayload {
  apy?: number;
  apyTokenSymbol: TokensWithAPY;

  name: string;
  lpToken: string;
  pools: Array<string>;

  unleveragableCollateral: Array<string>;
  leveragableCollateral: Array<string>;

  baseAssets: Array<string>;
}

interface PoolStats {
  borrowRate: number;
}

type PoolList = Record<string, PoolStats>;

interface LiquidationPriceProps {
  assets: Array<Asset>;
  prices: Record<string, BigNumber>;
  liquidationThresholds: Record<string, BigNumber>;

  borrowed: BigNumber;
  underlyingToken: string;

  lpAmount: BigNumber;
  lpToken: string;
}

export class Strategy {
  apy: number | undefined;

  name: string;

  lpToken: string;

  pools: Array<string>;

  unleveragableCollateral: Array<string>;

  leveragableCollateral: Array<string>;

  baseAssets: Array<string>;

  constructor(payload: StrategyPayload) {
    this.apy = payload.apy;

    this.name = payload.name;
    this.lpToken = payload.lpToken.toLowerCase();
    this.pools = payload.pools.map(addr => addr.toLowerCase());
    this.unleveragableCollateral = payload.unleveragableCollateral.map(addr =>
      addr.toLowerCase(),
    );
    this.leveragableCollateral = payload.leveragableCollateral.map(addr =>
      addr.toLowerCase(),
    );
    this.baseAssets = payload.baseAssets.map(addr => addr.toLowerCase());
  }

  static maxLeverage(lpToken: string, cms: Array<PartialCM>) {
    const [maxThreshold] = maxLeverageThreshold(lpToken, cms);

    const ONE = BigNumber.from(PERCENTAGE_FACTOR);
    const maxLeverage = ONE.mul(LEVERAGE_DECIMALS).div(ONE.sub(maxThreshold));
    return maxLeverage.sub(LEVERAGE_DECIMALS).toNumber();
  }

  maxAPY(maxLeverage: number, poolApy: PoolList) {
    const minApy = minBorrowApy(poolApy);

    return roi(
      this.apy || 0,
      maxLeverage,
      maxLeverage - LEVERAGE_DECIMALS,
      minApy,
    );
  }

  overallAPY(
    apy: number,
    leverage: number,
    depositCollateral: string,
    borrowAPY: number,
  ) {
    const farmLev = this.farmLev(leverage, depositCollateral);

    return roi(apy, farmLev, leverage - LEVERAGE_DECIMALS, borrowAPY);
  }

  // eslint-disable-next-line class-methods-use-this
  liquidationPrice({
    assets,
    prices,
    liquidationThresholds,

    borrowed,
    underlyingToken,

    lpAmount,
    lpToken,
  }: LiquidationPriceProps) {
    const collateralLTMoney = assets.reduce(
      (acc, { token: tokenAddress, balance: amount }) => {
        const tokenAddressLC = tokenAddress.toLowerCase();
        const tokenSymbol = tokenSymbolByAddress[tokenAddressLC];

        const lt = liquidationThresholds[tokenAddressLC] || BigNumber.from(0);
        const price = prices[tokenAddressLC] || BigNumber.from(0);
        const tokenDecimals = decimals[tokenSymbol];

        const money = calcTotalPrice(price, amount, tokenDecimals);
        const ltMoney = money.mul(lt).div(PERCENTAGE_FACTOR);

        return acc.add(ltMoney);
      },
      BigNumber.from(0),
    );

    const underlyingTokenAddressLC = underlyingToken.toLowerCase();
    const underlyingTokenSymbol =
      tokenSymbolByAddress[underlyingTokenAddressLC];
    const underlyingTokenDecimals = decimals[underlyingTokenSymbol];

    const underlyingPrice = prices[underlyingTokenAddressLC] || PRICE_DECIMALS;
    const borrowedMoney = calcTotalPrice(
      underlyingPrice,
      borrowed,
      underlyingTokenDecimals,
    );

    const lpTokenAddressLC = lpToken.toLowerCase();
    const lpTokenSymbol = tokenSymbolByAddress[lpTokenAddressLC];
    const lpTokenDecimals = decimals[lpTokenSymbol];

    const lpPrice = prices[lpTokenAddressLC] || PRICE_DECIMALS;
    const lpMoney = calcTotalPrice(lpPrice, lpAmount, lpTokenDecimals);

    if (lpMoney.gt(0)) {
      const lqPrice = borrowedMoney
        .sub(collateralLTMoney)
        .mul(WAD)
        .div(lpMoney);

      return lqPrice.gte(0) ? lqPrice : BigNumber.from(0);
    }

    return BigNumber.from(0);
  }

  protected farmLev(leverage: number, depositCollateral: string) {
    return this.inBaseAssets(depositCollateral) ||
      this.inLeveragableAssets(depositCollateral)
      ? leverage
      : leverage - LEVERAGE_DECIMALS;
  }

  protected inBaseAssets(depositCollateral: string) {
    return this.baseAssets.some(c => c === depositCollateral.toLowerCase());
  }

  protected inLeveragableAssets(depositCollateral: string) {
    return this.leveragableCollateral.some(
      c => c === depositCollateral.toLowerCase(),
    );
  }
}

function roi(apy: number, farmLev: number, debtLev: number, borrowAPY: number) {
  return (
    (((apy * farmLev) / PERCENTAGE_FACTOR - borrowAPY * debtLev) /
      LEVERAGE_DECIMALS) *
    PERCENTAGE_FACTOR
  );
}

function minBorrowApy(poolApy: PoolList) {
  const apys = Object.values(poolApy).sort(
    (a, b) => a.borrowRate - b.borrowRate,
  );

  return apys.length > 0 ? apys[0].borrowRate : 0;
}

type PartialCM = Pick<CreditManagerData, "liquidationThresholds" | "address">;

function maxLeverageThreshold(lpToken: string, cms: Array<PartialCM>) {
  const lpTokenLC = lpToken.toLowerCase();
  const ltByCM: Array<[string, BigNumber]> = cms.map(cm => {
    const lt = cm.liquidationThresholds[lpTokenLC] || BigNumber.from(0);
    return [cm.address, lt];
  });

  const sorted = ltByCM.sort(([, ltA], [, ltB]) => {
    if (ltA.gt(ltB)) return 1;
    if (ltB.gt(ltA)) return -1;
    return 0;
  });

  const [cm = "", lt = BigNumber.from(0)] = sorted[0] || [];

  return [lt, cm];
}
