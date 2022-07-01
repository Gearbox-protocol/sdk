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
  borrowAPY: number;
}

type PoolList = Record<string, PoolStats>;

const EXTERNAL_APY_DECIMALS = 100;

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
    return this.roi(maxLeverage, maxLeverage - 1, minApy);
  }

  public overallAPY(
    leverage: number,
    depositCollateral: string,
    pool: PoolStats | undefined
  ) {
    const farmLev = this.farmLev(leverage, depositCollateral);
    const borrowAPY = this.borrowApy(pool);

    return this.roi(farmLev, leverage - 1, borrowAPY);
  }

  public liquidationPrice(
    leverage: number,

    maxLeverage: number,
    ltCollateral: number,
    depositCollateral: string
  ) {
    const farmLev = this.farmLev(leverage, depositCollateral);
    const ltStrategy = this.ltStrategyLP(maxLeverage);

    return (
      1 -
      (leverage - 1 - ltCollateral * (leverage - farmLev)) /
        (ltStrategy * farmLev)
    );
  }

  private roi(farmLev: number, debtLev: number, borrowAPY: number) {
    return this.apy * farmLev - borrowAPY * debtLev;
  }

  private minBorrowApy(poolApy: PoolList) {
    const apys = Object.values(poolApy).sort(
      (a, b) => a.borrowAPY - b.borrowAPY
    );

    return apys.length > 0 ? apys[0].borrowAPY / EXTERNAL_APY_DECIMALS : 0;
  }

  private borrowApy(pool: PoolStats | undefined) {
    return pool ? pool.borrowAPY / EXTERNAL_APY_DECIMALS : 0;
  }

  private farmLev(leverage: number, depositCollateral: string) {
    return this.inBaseAssets(depositCollateral) ||
      this.inLeveragableAssets(depositCollateral)
      ? leverage
      : leverage - 1;
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

  private ltStrategyLP(maxLeverage: number) {
    return Math.floor(1 - 1 / maxLeverage);
  }
}
