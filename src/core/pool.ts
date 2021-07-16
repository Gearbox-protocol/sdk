import { BigNumber } from "ethers";
import { IAppPoolService } from "../types";
import { PoolDataPayload } from "../payload/pool";
import { rayToNumber } from "../utils/formatter";

export class PoolData {
  public readonly id: string;
  public readonly address: string;

  public readonly underlyingToken: string;
  public readonly dieselToken: string;
  public readonly isWETH: boolean;

  // Information
  public readonly expectedLiquidity: BigNumber;
  public readonly expectedLiquidityLimit: BigNumber;
  public readonly availableLiquidity: BigNumber;
  public readonly totalBorrowed: BigNumber;
  public readonly depositAPY: number;
  public readonly borrowAPY: number;
  public readonly dieselRate: number;
  public readonly dieselRateRay: BigNumber;
  public readonly withdrawFee: number;

  constructor(payload: PoolDataPayload) {
    this.id = payload.addr;
    this.address = payload.addr;
    this.underlyingToken = payload.underlyingToken;
    this.dieselToken = payload.dieselToken;
    this.isWETH = payload.isWETH;

    this.expectedLiquidity = BigNumber.from(payload.expectedLiquidity);
    this.expectedLiquidityLimit = BigNumber.from(
      payload.expectedLiquidityLimit
    );
    this.availableLiquidity = BigNumber.from(payload.availableLiquidity);
    this.totalBorrowed = BigNumber.from(payload.totalBorrowed);
    this.depositAPY = rayToNumber(payload.depositAPY_RAY) * 100;
    this.borrowAPY = rayToNumber(payload.borrowAPY_RAY) * 100;
    this.dieselRate = rayToNumber(payload.dieselRate_RAY);
    this.dieselRateRay = BigNumber.from(payload.dieselRate_RAY);
    this.withdrawFee = BigNumber.from(payload.withdrawFee).toNumber() / 100;
  }
}

export class PoolDataExtended extends PoolData {
  public readonly contractETH: IAppPoolService;

  constructor(payload: PoolDataPayload, contractETH: IAppPoolService) {
    super(payload);
    this.contractETH = contractETH;
  }
}

export interface PoolsStat {
  tvl: number;
  totalBorrowed: number;
}
