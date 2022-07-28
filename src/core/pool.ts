import { BigNumber, Signer } from "ethers";

import { PoolDataPayload } from "../payload/pool";
import { rayToNumber } from "../utils/formatter";

import { IPoolService, IPoolService__factory } from "../types";

import { PERCENTAGE_DECIMALS } from "./constants";

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

  public readonly borrowAPYRay: BigNumber;

  public readonly dieselRate: number;

  public readonly dieselRateRay: BigNumber;

  public readonly withdrawFee: number;

  public readonly timestampLU: BigNumber;

  public readonly cumulativeIndex_RAY: BigNumber;

  public readonly isPaused: boolean = false;

  constructor(payload: PoolDataPayload) {
    this.id = payload.addr;
    this.address = payload.addr;
    this.underlyingToken = payload.underlying || "";
    this.dieselToken = payload.dieselToken || "";

    this.isWETH = payload.isWETH || false;

    this.expectedLiquidity = BigNumber.from(payload.expectedLiquidity);
    this.expectedLiquidityLimit = BigNumber.from(
      payload.expectedLiquidityLimit || 0
    );
    this.availableLiquidity = BigNumber.from(payload.availableLiquidity);
    this.totalBorrowed = BigNumber.from(payload.totalBorrowed);
    this.depositAPY = rayToNumber(payload.depositAPY_RAY) * PERCENTAGE_DECIMALS;
    this.borrowAPY = rayToNumber(payload.borrowAPY_RAY) * PERCENTAGE_DECIMALS;
    this.borrowAPYRay = BigNumber.from(payload.borrowAPY_RAY);
    this.dieselRate = rayToNumber(payload.dieselRate_RAY);
    this.dieselRateRay = BigNumber.from(payload.dieselRate_RAY);
    this.withdrawFee =
      BigNumber.from(payload.withdrawFee).toNumber() / PERCENTAGE_DECIMALS;
    this.timestampLU = BigNumber.from(payload.timestampLU || 0);
    this.cumulativeIndex_RAY = BigNumber.from(payload.cumulativeIndex_RAY || 0);
  }

  getContractETH(signer: Signer): IPoolService {
    return IPoolService__factory.connect(this.address, signer);
  }
}

export interface PoolsStat {
  tvl: number;
  totalBorrowed: number;
}
