import { providers, Signer } from "ethers";

import {
  ChartsPoolDataPayload,
  PoolDataPayload,
  UserPoolPayload,
} from "../../payload/pool";
import { tokenSymbolByAddress } from "../../tokens/token";
import {
  IInterestRateModel__factory,
  IPoolService,
  IPoolService__factory,
} from "../../types";
import { rayToNumber, toBigInt } from "../../utils/formatter";
import { PERCENTAGE_DECIMALS, PERCENTAGE_FACTOR } from "../constants";

export class PoolData {
  readonly id: string;
  readonly address: string;
  readonly underlyingToken: string;
  readonly dieselToken: string;
  readonly isWETH: boolean;
  readonly isWSTETH: boolean;

  // Information
  readonly expectedLiquidity: bigint;
  readonly expectedLiquidityLimit: bigint;
  readonly availableLiquidity: bigint;
  readonly totalBorrowed: bigint;
  readonly depositAPY: number;
  readonly borrowAPY: number;
  readonly borrowAPYRay: bigint;
  readonly dieselRate: number;
  readonly dieselRateRay: bigint;
  readonly withdrawFee: number;
  readonly timestampLU: bigint;
  readonly cumulativeIndex_RAY: bigint;
  readonly isPaused: boolean = false;

  constructor(payload: PoolDataPayload) {
    this.id = payload.addr.toLowerCase();
    this.address = payload.addr.toLowerCase();
    this.underlyingToken = payload.underlying.toLowerCase();
    this.dieselToken = payload.dieselToken.toLowerCase();

    this.isWETH = payload.isWETH || false;
    this.isWSTETH =
      tokenSymbolByAddress[payload.underlying.toLowerCase()] === "wstETH";

    this.expectedLiquidity = toBigInt(payload.expectedLiquidity || 0);
    this.expectedLiquidityLimit = toBigInt(payload.expectedLiquidityLimit || 0);
    this.availableLiquidity = toBigInt(payload.availableLiquidity || 0);
    this.totalBorrowed = toBigInt(payload.totalBorrowed || 0);
    this.depositAPY =
      rayToNumber(payload.depositAPY_RAY) * Number(PERCENTAGE_DECIMALS);
    this.borrowAPY =
      rayToNumber(payload.borrowAPY_RAY) * Number(PERCENTAGE_DECIMALS);
    this.borrowAPYRay = toBigInt(payload.borrowAPY_RAY || 0);
    this.dieselRate = rayToNumber(payload.dieselRate_RAY || 0);
    this.dieselRateRay = toBigInt(payload.dieselRate_RAY || 0);
    this.withdrawFee =
      Number(toBigInt(payload.withdrawFee || 0)) / Number(PERCENTAGE_DECIMALS);
    this.timestampLU = toBigInt(payload.timestampLU || 0);
    this.cumulativeIndex_RAY = toBigInt(payload.cumulativeIndex_RAY || 0);
  }

  getContractETH(signer: Signer): IPoolService {
    return IPoolService__factory.connect(this.address, signer);
  }

  static async calculateBorrowRate({
    modelAddress,
    provider,
    expectedLiquidity,
    availableLiquidity,
  }: CalculateBorrowRateProps) {
    const model = IInterestRateModel__factory.connect(modelAddress, provider);
    return model.calcBorrowRate(expectedLiquidity, availableLiquidity);
  }
}

interface CalculateBorrowRateProps {
  modelAddress: string;
  provider: providers.Provider;
  expectedLiquidity: bigint;
  availableLiquidity: bigint;
}

export class ChartsPoolData {
  readonly id: string;
  readonly address: string;
  readonly underlyingToken: string;
  readonly dieselToken: string;
  readonly isWETH: boolean;

  readonly addLiqCount: number;
  readonly addedLiquidity: number;
  readonly removeLiqCount: number;
  readonly removedLiquidity: number;

  readonly earned7D: number;
  readonly earned7DInUSD: number;
  readonly utilization: number;

  readonly dieselRate: number;
  readonly dieselRateRay: bigint;
  readonly depositAPY: number;
  readonly depositAPYRay: bigint;
  readonly borrowAPY: number;
  readonly borrowAPYRay: bigint;
  readonly lmAPY: number;

  readonly availableLiquidity: bigint;
  readonly availableLiquidityChange: number;
  readonly availableLiquidityInUSD: number;

  readonly caLockedValue: number;
  readonly caLockedValueChange: number;
  readonly caLockedValueInUSD: number;

  readonly expectedLiquidity: bigint;
  readonly expectedLiquidityChange: number;
  readonly expectedLiquidityInUSD: number;
  readonly expectedLiqWeekAgo: number;
  readonly expectedLiquidityLimit: bigint;
  readonly expectedLiquidityLimitInUSD: number;

  readonly totalBorrowed: bigint;
  readonly totalBorrowedChange: number;
  readonly totalBorrowedInUSD: number;

  readonly debtWithInterest: bigint;
  readonly debtWithInterestChange: number;
  readonly debtWithInterestInUSD: number;
  readonly debtWithInterestOld: bigint;

  readonly oldAvailableLiquidity: bigint;
  readonly oldCALockedValue: number;
  readonly oldExpectedLiquidity: bigint;
  readonly oldTotalBorrowed: bigint;

  readonly withdrawFee: number;

  readonly depositAPY1DAverage: number;
  readonly depositAPY1DAverageChange: number;
  readonly depositAPY7DAverage: number;
  readonly depositAPY30DAverage: number;

  readonly oldUniqueLPs: number;
  readonly uniqueLPs: number;
  readonly uniqueLPsChange: number;

  constructor(payload: ChartsPoolDataPayload) {
    this.id = (payload.addr || "").toLowerCase();
    this.address = (payload.addr || "").toLowerCase();
    this.underlyingToken = (payload.underlyingToken || "").toLowerCase();
    this.dieselToken = (payload.dieselToken || "").toLowerCase();
    this.isWETH = payload.isWETH || false;

    this.earned7D = payload.earned7D || 0;
    this.earned7DInUSD = payload.earned7DInUSD || 0;
    this.utilization =
      Number(
        (toBigInt(payload.totalBorrowed || 0) * PERCENTAGE_FACTOR) /
          toBigInt(payload.expectedLiquidity || 0),
      ) / Number(PERCENTAGE_DECIMALS);

    this.dieselRate = rayToNumber(payload.dieselRate_RAY || 0);
    this.dieselRateRay = toBigInt(payload.dieselRate_RAY || 0);
    this.depositAPY =
      rayToNumber(payload.depositAPY_RAY || 0) * Number(PERCENTAGE_DECIMALS);
    this.depositAPYRay = toBigInt(payload.depositAPY_RAY);
    this.borrowAPY =
      rayToNumber(payload.borrowAPY_RAY || 0) * Number(PERCENTAGE_DECIMALS);
    this.borrowAPYRay = toBigInt(payload.borrowAPY_RAY || 0);
    this.lmAPY = (payload.lmAPY || 0) / Number(PERCENTAGE_DECIMALS);

    this.availableLiquidity = toBigInt(payload.availableLiquidity || 0);
    this.oldAvailableLiquidity = toBigInt(payload.availableLiquidityOld || 0);
    this.availableLiquidityChange =
      (payload.availableLiquidity10kBasis || 0) * Number(PERCENTAGE_DECIMALS);
    this.availableLiquidityInUSD = payload.availableLiquidityInUSD || 0;

    this.caLockedValue = payload.caLockedValue || 0;
    this.oldCALockedValue = payload.caLockedValueOld || 0;
    this.caLockedValueChange =
      (payload.caLockedValue10kBasis || 0) * Number(PERCENTAGE_DECIMALS);
    this.caLockedValueInUSD = payload.caLockedValueUSD || 0;

    this.expectedLiquidity = toBigInt(payload.expectedLiquidity || 0);
    this.oldExpectedLiquidity = toBigInt(payload.expectedLiquidityOld || 0);
    this.expectedLiquidityChange =
      (payload.expectedLiquidity10kBasis || 0) * Number(PERCENTAGE_DECIMALS);
    this.expectedLiquidityInUSD = payload.expectedLiquidityInUSD || 0;
    this.expectedLiqWeekAgo = payload.expectedLiqWeekAgo || 0;

    this.expectedLiquidityLimit = toBigInt(payload.expectedLiquidityLimit || 0);
    this.expectedLiquidityLimitInUSD = payload.expectedLiquidityLimitInUSD || 0;

    this.totalBorrowed = toBigInt(payload.totalBorrowed || 0);
    this.oldTotalBorrowed = toBigInt(payload.totalBorrowedOld || 0);
    this.totalBorrowedChange =
      (payload.totalBorrowed10kBasis || 0) * Number(PERCENTAGE_DECIMALS);
    this.totalBorrowedInUSD = payload.totalBorrowedInUSD || 0;

    this.debtWithInterest = toBigInt(payload.debtWithInterest || 0);
    this.debtWithInterestOld = toBigInt(payload.debtWithInterestOld || 0);
    this.debtWithInterestChange =
      (payload.debtWithInterest10kBasis || 0) * Number(PERCENTAGE_DECIMALS);
    this.debtWithInterestInUSD = payload.debtWithInterestInUSD || 0;

    this.withdrawFee = payload.withdrawFee || 0;

    this.addLiqCount = payload.addLiqCount || 0;
    this.addedLiquidity = payload.addedLiquidity || 0;
    this.removeLiqCount = payload.removeLiqCount || 0;
    this.removedLiquidity = payload.removedLiquidity || 0;

    this.depositAPY1DAverage =
      (payload.depositAPY1DAverage || 0) / Number(PERCENTAGE_DECIMALS);
    this.depositAPY1DAverageChange =
      (payload.depositAPY1DAverage10kBasis || 0) * Number(PERCENTAGE_DECIMALS);
    this.depositAPY7DAverage =
      (payload.depositAPY7DAverage || 0) / Number(PERCENTAGE_DECIMALS);
    this.depositAPY30DAverage =
      (payload.depositAPY30DAverage || 0) / Number(PERCENTAGE_DECIMALS);

    this.uniqueLPs = payload.uniqueLPs || 0;
    this.oldUniqueLPs = payload.uniqueLPsOld || 0;
    this.uniqueLPsChange =
      (payload.uniqueLPs10kBasis || 0) * Number(PERCENTAGE_DECIMALS);
  }
}

export class UserPoolData {
  readonly id: string;
  readonly address: string;
  readonly dieselToken: string;
  readonly underlyingToken: string;

  readonly depositAPY: number;
  readonly depositAPYRay: bigint;
  readonly lmAPY: number;

  readonly providedLiquidity: bigint;
  readonly providedLiquidityInUSD: number;

  readonly dieselBalance: bigint;
  readonly dieselBalanceInUSD: number;

  readonly lmRewards: bigint;
  readonly lmRewardsInUSD: number;

  readonly pnlInNativeToken: number;
  readonly pnlInUSD: number;

  readonly addedLiq: number;
  readonly addLiqCount: number;

  readonly removeLiqCount: number;
  readonly removedLiq: number;

  constructor(payload: UserPoolPayload) {
    this.id = (payload.pool || "").toLowerCase();
    this.address = payload.pool || "";
    this.underlyingToken = (payload.underlyingToken || "").toLowerCase();
    this.dieselToken = (payload.dieselToken || "").toLowerCase();

    this.depositAPY =
      rayToNumber(payload.depositAPY_RAY || 0) * Number(PERCENTAGE_DECIMALS);
    this.depositAPYRay = toBigInt(payload.depositAPY_RAY || 0);
    this.lmAPY = (payload.lmAPY || 0) / Number(PERCENTAGE_DECIMALS || 0);

    this.providedLiquidity = toBigInt(payload.liqValue || 0);
    this.providedLiquidityInUSD = payload.liqValueInUSD;

    this.dieselBalance = toBigInt(payload.dieselBalanceBI || 0);
    this.dieselBalanceInUSD = payload.dieselBalance;

    this.lmRewards = toBigInt(payload.lmRewards || 0);
    this.lmRewardsInUSD = payload.lmRewardsInUSD;

    this.pnlInNativeToken = payload.liqPnlInNativeToken;
    this.pnlInUSD = payload.liqPnlInUSD;

    this.addedLiq = payload.addedLiq;
    this.addLiqCount = payload.addLiqCount;

    this.removeLiqCount = payload.removeLiqCount;
    this.removedLiq = payload.removedLiq;
  }
}
