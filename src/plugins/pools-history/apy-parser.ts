import type { Address } from "viem";
import type {
  DataResult,
  ExternalApy,
  ExtraCollateralAPY,
  Output,
  PointsInfo,
  PoolExtraApy,
  PoolOutputDetails,
  PoolPointsInfo,
  TokenOutputDetails,
} from "../../rewards/apy/index.js";
import { PERCENTAGE_FACTOR } from "../../sdk/index.js";
import type { FarmRewardInfo, GearStats, NetworkApyData } from "./types.js";

export function numberToAPY(baseApy: number): number {
  return Math.round(baseApy * Number(PERCENTAGE_FACTOR));
}

export function parseGearStats(
  output: Output<string, string>,
): GearStats | null {
  const d = output.gearApy?.status === "ok" ? output.gearApy.data : undefined;
  if (!d) return null;
  return {
    base: numberToAPY(d.base ?? 0),
    crv: numberToAPY(d.crv ?? 0),
    gear: numberToAPY(d.gear ?? 0),
    gearPrice: d.gearPrice ?? 0,
  };
}

export function parseNetworkApy(
  apyResp: DataResult<TokenOutputDetails<string>[]> | undefined,
  poolResp: DataResult<PoolOutputDetails<string>[]> | undefined,
): NetworkApyData | undefined {
  const baseAPYList: Record<Address, number> = {};
  const extraCollateralAPYList: Record<
    Address,
    Record<Address, ExtraCollateralAPY>
  > = {};
  const basePointsList: Record<Address, PointsInfo<string>> = {};
  const extraCollateralPointsList: Record<
    Address,
    Record<Address, PointsInfo<string>>
  > = {};
  const tokenExtraRewardsList: Record<Address, Array<FarmRewardInfo>> = {};

  const apyData = apyResp?.status === "ok" ? apyResp.data : undefined;
  for (const d of apyData ?? []) {
    const tokenAddress = d.address.toLowerCase() as Address;
    const tokenSymbol = d.symbol;

    const apy = d.rewards.apy?.[0];
    if (apy) {
      baseAPYList[tokenAddress] = numberToAPY(apy.value ?? 0);
    }

    const points = d.rewards.points?.[0];
    if (points) {
      basePointsList[tokenAddress] = {
        address: tokenAddress,
        symbol: tokenSymbol,
        rewards: points.rewards.map(p => ({
          ...p,
          multiplier:
            p.multiplier === "soon" ? p.multiplier : BigInt(p.multiplier || 0),
        })),
        debtRewards: points.debtRewards?.map(p => ({
          ...p,
          cm: (p.cm || "").toLowerCase() as Address,
          multiplier:
            p.multiplier === "soon" ? p.multiplier : BigInt(p.multiplier || 0),
        })),
      };
    }

    const extraRewards = d.rewards.extraRewards;
    if (extraRewards && extraRewards.length > 0) {
      tokenExtraRewardsList[tokenAddress] = extraRewards.map(r => ({
        address: tokenAddress,
        symbol: r.rewardSymbol,
        rewardToken: r.rewardToken.toLowerCase() as Address,
        rewardSymbol: r.rewardSymbol,
        token: r.rewardToken.toLowerCase() as Address,
        finished: BigInt(r.finished || 0),
        duration: BigInt(r.duration || 0),
        reward: BigInt(r.reward || 0),
        balance: BigInt(r.balance || 0),
      }));
    }

    const ecApy = d.rewards.extraCollateralAPY;
    if (ecApy && ecApy.length > 0) {
      for (const ea of ecApy) {
        const pool = ea.pool.toLowerCase() as Address;
        if (!extraCollateralAPYList[pool]) extraCollateralAPYList[pool] = {};
        extraCollateralAPYList[pool][tokenAddress] = {
          ...ea,
          address: tokenAddress,
          symbol: tokenSymbol,
          pool,
          value: numberToAPY(ea.value ?? 0),
        };
      }
    }

    const ecPoints = d.rewards.extraCollateralPoints;
    if (ecPoints && ecPoints.length > 0) {
      for (const ea of ecPoints) {
        const pool = ea.pool.toLowerCase() as Address;
        if (!extraCollateralPointsList[pool])
          extraCollateralPointsList[pool] = {};
        extraCollateralPointsList[pool][tokenAddress] = {
          address: tokenAddress,
          symbol: tokenSymbol,
          rewards: ea.rewards.map(p => ({
            ...p,
            multiplier:
              p.multiplier === "soon"
                ? p.multiplier
                : BigInt(p.multiplier || 0),
          })),
          debtRewards: ea.debtRewards?.map(p => ({
            ...p,
            cm: (p.cm || "").toLowerCase() as Address,
            multiplier:
              p.multiplier === "soon"
                ? p.multiplier
                : BigInt(p.multiplier || 0),
          })),
        };
      }
    }
  }

  const poolRewardsList: Record<Address, Array<PoolPointsInfo<string>>> = {};
  const poolExternalAPYList: Record<Address, Array<ExternalApy>> = {};
  const poolExtraAPYList: Record<Address, Array<PoolExtraApy>> = {};

  const poolData = poolResp?.status === "ok" ? poolResp.data : undefined;
  for (const r of poolData ?? []) {
    const pool = (r.pool || "").toLowerCase() as Address;

    const points = r.rewards.points;
    if (points && points.length > 0) {
      poolRewardsList[pool] = points.map(p => ({
        ...p,
        token: p.token.toLowerCase() as Address,
        pool,
        amount: BigInt(p.amount || 0),
      }));
    }

    const externalAPY = r.rewards.externalAPY;
    if (externalAPY && externalAPY.length > 0) {
      poolExternalAPYList[pool] = externalAPY.map(ex => ({ ...ex, pool }));
    }

    const extraAPY = r.rewards.extraAPY;
    if (extraAPY && extraAPY.length > 0) {
      poolExtraAPYList[extraAPY[0].token.toLowerCase() as Address] =
        extraAPY.map(ex => ({
          ...ex,
          token: ex.token.toLowerCase() as Address,
          rewardToken: ex.rewardToken.toLowerCase() as Address,
        }));
    }
  }

  const allResponses = [apyResp, poolResp];
  const allErrors = allResponses.filter(r => r?.status === "error");
  if (allResponses.length > 0 && allErrors.length === allResponses.length) {
    return undefined;
  }

  return {
    apyList: Object.keys(baseAPYList).length > 0 ? baseAPYList : undefined,
    extraCollateralAPYList:
      Object.keys(extraCollateralAPYList).length > 0
        ? extraCollateralAPYList
        : undefined,
    pointsList:
      Object.keys(basePointsList).length > 0 ? basePointsList : undefined,
    extraCollateralPointsList:
      Object.keys(extraCollateralPointsList).length > 0
        ? extraCollateralPointsList
        : undefined,
    poolRewardsList:
      Object.keys(poolRewardsList).length > 0 ? poolRewardsList : undefined,
    tokenExtraRewardsList:
      Object.keys(tokenExtraRewardsList).length > 0
        ? tokenExtraRewardsList
        : undefined,
    poolExternalAPYList:
      Object.keys(poolExternalAPYList).length > 0
        ? poolExternalAPYList
        : undefined,
    poolExtraAPYList:
      Object.keys(poolExtraAPYList).length > 0 ? poolExtraAPYList : undefined,
  };
}
