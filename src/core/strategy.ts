import { BigNumber } from "ethers";
import { LEVERAGE_DECIMALS, PERCENTAGE_FACTOR, WAD } from "../core/constants";
import { calcTotalPrice } from "../core/price";

export interface StrategyPayload {
  apy?: number;

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

interface TokenDescription {
  price: BigNumber;
  amount: BigNumber;
  decimals: number | undefined;
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

  public maxAPY(apy: number, maxLeverage: number, poolApy: PoolList) {
    const minApy = this.minBorrowApy(poolApy);

    return this.roi(apy, maxLeverage, maxLeverage - LEVERAGE_DECIMALS, minApy);
  }

  public overallAPY(
    apy: number,
    leverage: number,
    depositCollateral: string,
    borrowAPY: number
  ) {
    const farmLev = this.farmLev(leverage, depositCollateral);

    return this.roi(apy, farmLev, leverage - LEVERAGE_DECIMALS, borrowAPY);
  }

  public liquidationPrice(
    borrowed: TokenDescription,
    collateral: TokenDescription,
    lp: TokenDescription,
    ltCollateral: BigNumber
  ) {
    const borrowedMoney = calcTotalPrice(
      borrowed.price,
      borrowed.amount,
      borrowed.decimals
    );
    const collateralMoney = calcTotalPrice(
      collateral.price,
      collateral.amount,
      collateral.decimals
    )
      .mul(ltCollateral)
      .div(PERCENTAGE_FACTOR);
    const lpMoney = calcTotalPrice(lp.price, lp.amount, lp.decimals);

    return lpMoney.gt(0)
      ? borrowedMoney.sub(collateralMoney).mul(WAD).div(lpMoney)
      : BigNumber.from(0);
  }

  private roi(
    apy: number,
    farmLev: number,
    debtLev: number,
    borrowAPY: number
  ) {
    return (apy * farmLev - borrowAPY * debtLev) / LEVERAGE_DECIMALS;
  }

  private minBorrowApy(poolApy: PoolList) {
    const apys = Object.values(poolApy).sort(
      (a, b) => a.borrowRate - b.borrowRate
    );

    return apys.length > 0 ? apys[0].borrowRate : 0;
  }

  private farmLev(leverage: number, depositCollateral: string) {
    return this.inBaseAssets(depositCollateral) ||
      this.inLeveragableAssets(depositCollateral)
      ? leverage
      : leverage - LEVERAGE_DECIMALS;
  }

  private inBaseAssets(depositCollateral: string) {
    return this.baseAssets.some(
      c => c.toLowerCase() === depositCollateral.toLowerCase()
    );
  }

  private inLeveragableAssets(depositCollateral: string) {
    return this.leveragableCollateral.some(
      c => c.toLowerCase() === depositCollateral.toLowerCase()
    );
  }
}
