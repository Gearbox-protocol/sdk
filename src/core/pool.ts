import {
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  toBigInt,
} from "@gearbox-protocol/sdk-gov";
import { Address, getContract, PublicClient } from "viem";

import {
  ChartsPoolDataPayload,
  LinearModel,
  PoolDataExtraPayload,
  PoolDataPayload,
  UserPoolPayload,
} from "../payload/pool";
import { iInterestRateModelAbi } from "../types";
import { rayToNumber } from "../utils/formatter";

export type PoolType = "universal" | "trade" | "farm";

export class PoolData {
  readonly address: Address;
  readonly type: PoolType;
  readonly underlyingToken: Address;
  readonly dieselToken: Address;
  readonly stakedDieselToken: Array<Address>;
  readonly stakedDieselToken_old: Array<Address>;
  readonly isPaused: boolean;
  readonly version: number;
  readonly poolQuotaKeeper: Address;
  readonly gauge: Address;
  readonly name: string;
  readonly symbol: string;

  // Information
  readonly expectedLiquidity: bigint;
  readonly expectedLiquidityLimit: bigint;
  readonly availableLiquidity: bigint;
  readonly baseInterestIndex: bigint;
  readonly utilization: number;

  readonly totalBorrowed: bigint;
  readonly totalDebtLimit: bigint;
  readonly creditManagerDebtParams: Record<
    Address,
    {
      creditManager: Address;
      borrowed: bigint;
      limit: bigint;
      availableToBorrow: bigint;
    }
  >;
  readonly quotas: Record<
    Address,
    {
      token: Address;
      rate: bigint;
      quotaIncreaseFee: bigint;
      totalQuoted: bigint;
      limit: bigint;
      isActive: boolean;
    }
  >;
  readonly zappers: Record<
    Address,
    Record<
      Address,
      {
        zapper: Address;
        tokenIn: Address;
        tokenOut: Address;
      }
    >
  >;

  readonly totalAssets: bigint;
  readonly totalSupply: bigint;

  readonly supplyAPY7D: number | undefined;
  readonly depositAPY: number;
  readonly borrowAPY: number;

  readonly interestModel: LinearModel;
  readonly dieselRate: number;
  readonly dieselRateRay: bigint;
  readonly withdrawFee: number;
  readonly lastBaseInterestUpdate: bigint;

  constructor(payload: PoolDataPayload, extra: PoolDataExtraPayload) {
    this.address = payload.addr.toLowerCase() as Address;
    this.type = PoolData.getPoolType(payload.name || "");
    this.underlyingToken = payload.underlying.toLowerCase() as Address;
    this.dieselToken = payload.dieselToken.toLowerCase() as Address;
    this.stakedDieselToken = (extra.stakedDieselToken || []).map(
      t => t.toLowerCase() as Address,
    );
    this.stakedDieselToken_old = (extra.stakedDieselToken_old || []).map(
      t => t.toLowerCase() as Address,
    );
    this.isPaused = payload.isPaused;
    this.version = Number(payload.version);
    this.poolQuotaKeeper = payload.poolQuotaKeeper.toLowerCase() as Address;
    this.gauge = payload.gauge.toLowerCase() as Address;
    this.name = payload.name;
    this.symbol = payload.symbol;

    const expected = payload.expectedLiquidity;
    const available = payload.availableLiquidity;
    this.expectedLiquidity = expected;
    this.availableLiquidity = available;
    this.expectedLiquidityLimit =
      this.expectedLiquidity + this.availableLiquidity;
    this.baseInterestIndex = payload.baseInterestIndex;

    this.utilization = PoolData.calculateUtilization(expected, available);

    this.totalBorrowed = payload.totalBorrowed;
    this.totalDebtLimit = payload.totalDebtLimit;
    this.creditManagerDebtParams = payload.creditManagerDebtParams.reduce<
      PoolData["creditManagerDebtParams"]
    >((acc, p) => {
      const creditManager = p.creditManager.toLowerCase() as Address;
      acc[creditManager] = {
        creditManager,
        borrowed: p.borrowed,
        limit: p.limit,
        availableToBorrow: p.availableToBorrow,
      };

      return acc;
    }, {});

    this.quotas = payload.quotas.reduce<PoolData["quotas"]>((acc, q) => {
      const token = q.token.toLowerCase() as Address;
      acc[token] = {
        token,
        rate: toBigInt(q.rate) * PERCENTAGE_DECIMALS,
        quotaIncreaseFee: toBigInt(q.quotaIncreaseFee),
        totalQuoted: q.totalQuoted,
        limit: q.limit,
        isActive: q.isActive,
      };

      return acc;
    }, {});

    this.zappers = payload.zappers.reduce<PoolData["zappers"]>((acc, z) => {
      const tokenIn = z.tokenIn.toLowerCase() as Address;
      const tokenOut = z.tokenOut.toLowerCase() as Address;
      const zapper = z.zapper.toLowerCase() as Address;
      const old = acc[tokenIn] || {};

      return {
        ...acc,
        [tokenIn]: {
          ...old,
          [tokenOut]: { tokenIn, tokenOut, zapper },
        },
      };
    }, {});

    this.totalAssets = payload.totalAssets;
    this.totalSupply = payload.totalSupply;

    this.depositAPY = rayToNumber(payload.supplyRate * PERCENTAGE_DECIMALS);
    this.borrowAPY = rayToNumber(
      payload.baseInterestRate * PERCENTAGE_DECIMALS,
    );
    this.supplyAPY7D = extra.supplyAPY7D;

    this.interestModel = {
      interestModel: payload.lirm.interestModel.toLowerCase() as Address,
      U_1: toBigInt(payload.lirm.U_1),
      U_2: toBigInt(payload.lirm.U_2),
      R_base: toBigInt(payload.lirm.R_base),
      R_slope1: toBigInt(payload.lirm.R_slope1),
      R_slope2: toBigInt(payload.lirm.R_slope2),
      R_slope3: toBigInt(payload.lirm.R_slope3),
      version: Number(payload?.lirm?.version),
      isBorrowingMoreU2Forbidden: payload?.lirm?.isBorrowingMoreU2Forbidden,
    };
    this.dieselRate = rayToNumber(payload.dieselRate_RAY);
    this.dieselRateRay = payload.dieselRate_RAY;
    this.lastBaseInterestUpdate = payload.lastBaseInterestUpdate;
    this.withdrawFee =
      Number(payload.withdrawFee) / Number(PERCENTAGE_DECIMALS);
  }

  async calculateBorrowRate({
    provider,
    expectedLiquidity,
    availableLiquidity,
  }: CalculateBorrowRateProps) {
    const model = getContract({
      address: this.interestModel.interestModel,
      abi: iInterestRateModelAbi,
      client: provider,
    });

    return model.read.calcBorrowRate([expectedLiquidity, availableLiquidity]);
  }

  static getPoolType(name: string): PoolType {
    const [identity = ""] = name.split(" ") || [];
    const lc = identity.toLowerCase();

    if (lc === "farm") return "farm";
    if (lc === "trade") return "trade";

    return "universal";
  }

  static calculateUtilization(expected: bigint, available: bigint) {
    return expected > 0
      ? Number(((expected - available) * PERCENTAGE_FACTOR) / expected) /
          Number(PERCENTAGE_DECIMALS)
      : 0;
  }
}

interface CalculateBorrowRateProps {
  provider: PublicClient;
  expectedLiquidity: bigint;
  availableLiquidity: bigint;
}

export class ChartsPoolData {
  readonly address: Address;
  readonly underlyingToken: Address;
  readonly dieselToken: Address;
  readonly type: PoolType;
  readonly version: number;
  readonly name: string;

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
  readonly lmRewardAll: Array<{ apy: number; token: Address }>;

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
    this.address = (payload.addr || "").toLowerCase() as Address;
    this.underlyingToken = (
      payload.underlyingToken || ""
    ).toLowerCase() as Address;
    this.dieselToken = (payload.dieselToken || "").toLowerCase() as Address;
    this.type = PoolData.getPoolType(payload.name || "");
    this.version = payload.version || 1;
    this.name = payload.name || "";

    this.earned7D = payload.earned7D || 0;
    this.earned7DInUSD = payload.earned7DInUSD || 0;

    this.dieselRate = rayToNumber(payload.dieselRate_RAY || 0);
    this.dieselRateRay = toBigInt(payload.dieselRate_RAY || 0);
    this.depositAPY =
      rayToNumber(payload.depositAPY_RAY || 0) * Number(PERCENTAGE_DECIMALS);
    this.depositAPYRay = toBigInt(payload.depositAPY_RAY);
    this.borrowAPY =
      rayToNumber(payload.borrowAPY_RAY || 0) * Number(PERCENTAGE_DECIMALS);
    this.borrowAPYRay = toBigInt(payload.borrowAPY_RAY || 0);
    this.lmAPY = (payload.lmAPY || 0) / Number(PERCENTAGE_DECIMALS);
    this.lmRewardAll = (payload.lmRewardAll || []).map(r => ({
      apy: (r.apy || 0) / Number(PERCENTAGE_DECIMALS),
      token: (r.token || "").toLowerCase() as Address,
    }));

    const expected = toBigInt(payload.expectedLiquidity || 0);
    const available = toBigInt(payload.availableLiquidity || 0);
    this.availableLiquidity = available;
    this.oldAvailableLiquidity = toBigInt(payload.availableLiquidityOld || 0);
    this.availableLiquidityChange =
      (payload.availableLiquidity10kBasis || 0) * Number(PERCENTAGE_DECIMALS);
    this.availableLiquidityInUSD = payload.availableLiquidityInUSD || 0;

    this.utilization = PoolData.calculateUtilization(expected, available);

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
  readonly address: Address;
  readonly dieselToken: Address;
  readonly underlyingToken: Address;

  readonly depositAPY: number;
  readonly depositAPYRay: bigint;
  readonly lmAPY: number;
  readonly lmRewardAll: Array<{ apy: number; token: Address }>;

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
    this.address = (payload.pool || "").toLowerCase() as Address;
    this.underlyingToken = (
      payload.underlyingToken || ""
    ).toLowerCase() as Address;
    this.dieselToken = (payload.dieselToken || "").toLowerCase() as Address;

    this.depositAPY =
      rayToNumber(payload.depositAPY_RAY || 0) * Number(PERCENTAGE_DECIMALS);
    this.depositAPYRay = toBigInt(payload.depositAPY_RAY || 0);
    this.lmAPY = (payload.lmAPY || 0) / Number(PERCENTAGE_DECIMALS || 0);
    this.lmRewardAll = (payload.lmRewardAll || []).map(r => ({
      apy: (r.apy || 0) / Number(PERCENTAGE_DECIMALS),
      token: (r.token || "").toLowerCase() as Address,
    }));

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
