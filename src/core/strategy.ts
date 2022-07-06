import { LEVERAGE_DECIMALS } from "../core/constants";

export interface StrategyPayload {
  apy: number;

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

export class Strategy {
  apy: number;

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

  public roiMax(maxLeverage: number, poolApy: PoolList) {
    const minApy = this.minBorrowApy(poolApy);
    return this.roi(maxLeverage, maxLeverage - LEVERAGE_DECIMALS, minApy);
  }

  public overallAPY(
    leverage: number,
    depositCollateral: string,
    borrowAPY: number
  ) {
    const farmLev = this.farmLev(leverage, depositCollateral);

    return this.roi(farmLev, leverage - LEVERAGE_DECIMALS, borrowAPY);
  }

  public liquidationPrice(
    leverage: number,

    ltStrategy: number,
    ltCollateral: number,

    depositCollateral: string
  ) {
    const farmLev = this.farmLev(leverage, depositCollateral);

    return (
      1 -
      (leverage - LEVERAGE_DECIMALS - ltCollateral * (leverage - farmLev)) /
        (ltStrategy * farmLev)
    );
  }

  public ltStrategyLP(maxLeverage: number) {
    return 1 - LEVERAGE_DECIMALS / maxLeverage;
  }

  private roi(farmLev: number, debtLev: number, borrowAPY: number) {
    return (this.apy * farmLev - borrowAPY * debtLev) / LEVERAGE_DECIMALS;
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
