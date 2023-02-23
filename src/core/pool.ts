import { BigNumber, providers, Signer } from "ethers";

import { ChartsPoolDataPayload, PoolDataPayload } from "../payload/pool";
import {
  IInterestRateModel,
  IInterestRateModel__factory,
  IPoolService,
  IPoolService__factory,
} from "../types";
import { rayToNumber } from "../utils/formatter";
import { PERCENTAGE_DECIMALS, PERCENTAGE_FACTOR } from "./constants";

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
    this.id = payload.addr.toLowerCase();
    this.address = payload.addr.toLowerCase();
    this.underlyingToken = payload.underlying.toLowerCase();
    this.dieselToken = payload.dieselToken.toLowerCase();

    this.isWETH = payload.isWETH || false;

    this.expectedLiquidity = BigNumber.from(payload.expectedLiquidity);
    this.expectedLiquidityLimit = BigNumber.from(
      payload.expectedLiquidityLimit || 0,
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

  async calculateBorrowRate({
    modelAddress,
    provider,
    expectedLiquidityChange = BigNumber.from(0),
    availableLiquidityChange = BigNumber.from(0),
  }: calculateBorrowRateProps) {
    const model = IInterestRateModel__factory.connect(modelAddress, provider);
    return model.calcBorrowRate(
      this.expectedLiquidity.add(expectedLiquidityChange),
      this.availableLiquidity.add(availableLiquidityChange),
    );
  }
}

interface calculateBorrowRateProps {
  modelAddress: string;
  provider: providers.Provider;
  expectedLiquidityChange?: BigNumber;
  availableLiquidityChange?: BigNumber;
}

export class ChartsPoolData extends PoolData {
  public readonly expectedLiquidityInUSD: number;
  public readonly expectedLiquidityLimitInUSD: number;
  public readonly availableLiquidityInUSD: number;
  public readonly caLockedValueInUSD: number;
  public readonly totalBorrowedInUSD: number;
  public readonly uniqueLPs: number;
  public readonly depositAPY7D: number;
  public readonly depositAPY30D: number;
  public readonly lmAPY: number;

  constructor({
    expectedLiquidityInUSD,
    expectedLiquidityLimitInUSD,
    availableLiquidityInUSD,
    totalBorrowedInUSD,
    caLockedValueInUSD,
    uniqueLPs,
    dieselAPY7D = 0,
    dieselAPY30D = 0,
    lmAPY,
    ...restPayload
  }: ChartsPoolDataPayload) {
    const {
      underlying = restPayload.underlyingToken,
      linearCumulativeIndex = 0,
      cumulativeIndex_RAY: cumulativeIndexRAY = 0,
      timestampLU = 0,
      version = 1,
      ...v1Props
    } = restPayload;
    super({
      ...v1Props,
      underlying,
      linearCumulativeIndex,
      cumulativeIndex_RAY: cumulativeIndexRAY,
      timestampLU,
      version,
    });

    this.expectedLiquidityInUSD = expectedLiquidityInUSD;
    this.expectedLiquidityLimitInUSD = expectedLiquidityLimitInUSD;
    this.availableLiquidityInUSD = availableLiquidityInUSD;
    this.totalBorrowedInUSD = totalBorrowedInUSD;
    this.uniqueLPs = uniqueLPs;
    this.depositAPY7D = dieselAPY7D / PERCENTAGE_DECIMALS;
    this.depositAPY30D = dieselAPY30D / PERCENTAGE_DECIMALS;
    this.caLockedValueInUSD = caLockedValueInUSD;
    this.lmAPY = lmAPY / PERCENTAGE_FACTOR;
  }
}
