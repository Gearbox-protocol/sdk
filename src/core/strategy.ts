import { BigNumber } from "ethers";

import { TokensWithAPY } from "../apy";
import { TokenData } from "../tokens/tokenData";
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
  tokensList: Record<string, TokenData>;
  liquidationThresholds: Record<string, BigNumber>;

  borrowed: BigNumber;
  underlyingToken: TokenData;

  lpAmount: BigNumber;
  lpToken: TokenData;
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
    this.lpToken = payload.lpToken;
    this.pools = payload.pools;
    this.unleveragableCollateral = payload.unleveragableCollateral;
    this.leveragableCollateral = payload.leveragableCollateral;
    this.baseAssets = payload.baseAssets;
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
    tokensList,
    liquidationThresholds,

    borrowed,
    underlyingToken,

    lpAmount,
    lpToken,
  }: LiquidationPriceProps) {
    const collateralLTMoney = assets.reduce(
      (acc, { token: tokenAddress, balance: amount }) => {
        const lt = liquidationThresholds[tokenAddress] || BigNumber.from(0);
        const price = prices[tokenAddress] || BigNumber.from(0);
        const token = tokensList[tokenAddress];

        const money = calcTotalPrice(price, amount, token?.decimals);
        const ltMoney = money.mul(lt).div(PERCENTAGE_FACTOR);

        return acc.add(ltMoney);
      },
      BigNumber.from(0),
    );

    const underlyingPrice =
      prices[underlyingToken?.address || ""] || PRICE_DECIMALS;
    const borrowedMoney = calcTotalPrice(
      underlyingPrice,
      borrowed,
      underlyingToken?.decimals,
    );

    const lpPrice = prices[lpToken?.address || ""] || PRICE_DECIMALS;
    const lpMoney = calcTotalPrice(lpPrice, lpAmount, lpToken?.decimals);

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
    return this.baseAssets.some(
      c => c.toLowerCase() === depositCollateral.toLowerCase(),
    );
  }

  protected inLeveragableAssets(depositCollateral: string) {
    return this.leveragableCollateral.some(
      c => c.toLowerCase() === depositCollateral.toLowerCase(),
    );
  }
}

function roi(apy: number, farmLev: number, debtLev: number, borrowAPY: number) {
  return (apy * farmLev - borrowAPY * debtLev) / LEVERAGE_DECIMALS;
}

function minBorrowApy(poolApy: PoolList) {
  const apys = Object.values(poolApy).sort(
    (a, b) => a.borrowRate - b.borrowRate,
  );

  return apys.length > 0 ? apys[0].borrowRate : 0;
}

type PartialCM = Pick<CreditManagerData, "liquidationThresholds" | "address">;

function maxLeverageThreshold(lpToken: string, cms: Array<PartialCM>) {
  const ltByCM: Array<[string, BigNumber]> = cms.map(cm => {
    const lt = cm.liquidationThresholds[lpToken] || BigNumber.from(0);
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
