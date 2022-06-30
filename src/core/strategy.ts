export interface StrategyPayload {
  apy: number;
  poolApy: Record<string, number>;
  ltStrategyLP: number;

  name: string;
  lpToken: string;
  pools: Array<string>;

  unleveragableCollateral: Array<string>;
  leveragableCollateral: Array<string>;

  baseAssets: Array<string>;
}

export class Strategy {
  apy: number;
  poolApy: Record<string, number>;

  ltStrategyLP: number;

  name: string;
  lpToken: string;
  pools: Array<string>;

  unleveragableCollateral: Array<string>;
  leveragableCollateral: Array<string>;

  baseAssets: Array<string>;

  constructor(payload: StrategyPayload) {
    this.apy = payload.apy;
    this.poolApy = payload.poolApy;
    this.ltStrategyLP = payload.ltStrategyLP;

    this.name = payload.name;
    this.lpToken = payload.lpToken;
    this.pools = payload.pools;
    this.unleveragableCollateral = payload.unleveragableCollateral;
    this.leveragableCollateral = payload.leveragableCollateral;
    this.baseAssets = payload.baseAssets;
  }

  public roiMax() {
    const max = this.maxLeverage();

    return this.roi(max, max - 1, this.minBorrowApy());
  }

  public maxLeverage() {
    return Math.floor(1 / (1 - this.ltStrategyLP));
  }

  private minBorrowApy() {
    return Object.values(this.poolApy).filter((a, b) => a - b)[0] || 0;
  }

  private roi(farmLev: number, debtLev: number, borrowAPY: number) {
    return this.apy * farmLev - borrowAPY * debtLev;
  }

  private borrowApy(pool: string) {
    return this.poolApy[pool] || 0;
  }

  private farmLev(leverage: number, depositCollateral: string) {
    const depositIsUnleveragable = this.unleveragableCollateral.some(
      c => c.toLowerCase() === depositCollateral.toLowerCase()
    );
    return depositIsUnleveragable ? leverage - 1 : leverage;
  }

  public overallAPY(leverage: number, depositCollateral: string) {
    const farmLev = this.farmLev(leverage, depositCollateral);
    const borrowAPY = this.borrowApy(depositCollateral);

    return this.roi(farmLev, leverage - 1, borrowAPY);
  }

  public liquidationPrice(leverage: number, depositCollateral: string) {
    const farmLev = this.farmLev(leverage, depositCollateral);
    const ltCollateral = 0.5;

    return (
      1 -
      (leverage - 1 - ltCollateral * (leverage - farmLev)) /
        (this.ltStrategyLP * farmLev)
    );
  }
}
