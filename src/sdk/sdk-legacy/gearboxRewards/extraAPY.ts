import axios from "axios";
import type { Address } from "viem";

import type { NetworkType } from "../../chain/index.js";
import { chains } from "../../chain/index.js";
import { PERCENTAGE_FACTOR } from "../../constants/index.js";
import type { Asset } from "../../router/index.js";
import { GearboxBackendApi } from "../core/endpoint.js";
import type { PoolData_Legacy } from "../core/pool.js";
import type { TokenData } from "../tokens/tokenData.js";
import { toBN } from "../utils/formatter.js";
import { BigIntMath } from "../utils/math.js";

export interface PoolPointsInfo {
  pool: Address;
  token: Address;
  symbol: string;

  amount: bigint;
  duration: string | undefined;
  name: string;
  type: string;
  estimation: "absolute" | "relative";
  condition: "deposit" | "cross-chain-deposit" | "holding";
}

type PartialPool = Pick<
  PoolData_Legacy,
  "expectedLiquidity" | "underlyingToken" | "address"
>;

export interface GetPointsByPoolProps {
  poolRewards: Record<Address, Array<PoolPointsInfo>>;

  totalTokenBalances: Record<Address, Asset>;
  pools: Array<PartialPool>;
  tokensList: Record<Address, TokenData>;
}

interface WalletResult {
  borrower: Address;
  effective_balance: number;
}

interface GetBalanceAtResponse {
  result: Array<WalletResult>;
}

export interface GetTotalTokensOnProtocolProps {
  tokensToCheck: Array<Address>;

  tokensList: Record<Address, TokenData>;
  network: NetworkType;
}

export type PoolPointsBase = Record<
  Address,
  Array<{
    key: string;
    info: PoolPointsInfo;
    points: bigint;
  }>
>;

export function getKeyForPoolPointsInfo(i: PoolPointsInfo) {
  return [
    i.pool,
    i.token,
    i.symbol,
    i.duration,
    i.name,
    i.type,
    i.estimation,
    i.condition,
  ].join("-");
}

export class GearboxRewardsExtraApy {
  static async getTotalTokensOnProtocol({
    tokensToCheck,

    tokensList,
    network,
  }: GetTotalTokensOnProtocolProps) {
    const list = [...new Set(tokensToCheck)];

    const res = await Promise.allSettled(
      list.map(t =>
        GearboxRewardsExtraApy.getTokenTotal(t, network, tokensList),
      ),
    );

    return res.map((r, i): [Address, PromiseSettledResult<Asset>] => [
      list[i],
      r,
    ]);
  }

  private static async getTokenTotal(
    token: Address,
    network: NetworkType,
    tokensList: Record<Address, TokenData>,
  ) {
    const chainId = chains[network]?.id;

    const url = GearboxBackendApi.getChartsUrl("getBalanceAt", chainId, {
      params: {
        asset: token,
      },
    });

    const result = await axios.get<GetBalanceAtResponse>(url);
    const balance = result.data.result.reduce(
      (sum, r) => r.effective_balance + sum,
      0,
    );
    const { decimals = 18 } = tokensList[token] || {};

    return { token, balance: toBN(String(balance), decimals) };
  }

  static getPointsByPool({
    poolRewards,

    totalTokenBalances,
    pools,
    tokensList,
  }: GetPointsByPoolProps) {
    const r = pools.reduce<PoolPointsBase>((acc, p) => {
      const pointsInfo = poolRewards[p.address] || [];

      const poolPointsList = pointsInfo.reduce<PoolPointsBase[Address]>(
        (acc, pointsInfo) => {
          const { address: tokenAddress } = tokensList[pointsInfo.token];
          const tokenBalance = totalTokenBalances[tokenAddress || ""];

          const points = GearboxRewardsExtraApy.getPoolTokenPoints(
            tokenBalance,
            p,
            tokensList,
            pointsInfo,
          );

          if (points !== null) {
            acc.push({
              key: getKeyForPoolPointsInfo(pointsInfo),
              info: pointsInfo,
              points,
            });
          }

          return acc;
        },
        [],
      );

      acc[p.address] = poolPointsList;

      return acc;
    }, {});

    return r;
  }

  private static getPoolTokenPoints(
    tokenBalanceInPool: Asset | undefined,
    pool: PartialPool,
    tokensList: Record<Address, TokenData>,
    pointsInfo: PoolPointsInfo,
  ) {
    if (pool.expectedLiquidity <= 0) return 0n;
    if (pointsInfo.estimation === "relative" && !tokenBalanceInPool)
      return null;

    const { decimals = 18 } = tokensList[pointsInfo.token] || {};
    const targetFactor = 10n ** BigInt(decimals);

    const defaultPoints =
      (pointsInfo.amount * targetFactor) / PERCENTAGE_FACTOR;
    if (pointsInfo.estimation === "absolute") return defaultPoints;

    const { decimals: underlyingDecimals = 18 } =
      tokensList[pool.underlyingToken] || {};
    const underlyingFactor = 10n ** BigInt(underlyingDecimals);

    const points =
      ((tokenBalanceInPool?.balance || 0n) * defaultPoints) /
      ((pool.expectedLiquidity * targetFactor) / underlyingFactor);

    return BigIntMath.min(points, defaultPoints);
  }
}
