import axios from "axios";
import type { Address } from "viem";
import { BigIntMath } from "../../common-utils/index.js";
import {
  type Asset,
  chains,
  type MarketSuite,
  type NetworkType,
  PERCENTAGE_FACTOR,
  type TokensMeta,
  toBN,
} from "../../sdk/index.js";
import type { PoolPointsInfo } from "../index.js";
import type { TokenData } from "./common.js";

export interface GetPointsByPoolProps {
  poolRewards: Record<Address, Array<PoolPointsInfo<string>>>;

  totalTokenBalances: Record<Address, Asset>;
  pools: MarketSuite[];
  tokensList: TokensMeta;
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
    info: PoolPointsInfo<string>;
    points: bigint;
  }>
>;

export function getKeyForPoolPointsInfo(i: PoolPointsInfo<string>) {
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

export class PoolPointsAPI {
  private constructor() {}

  static async getTotalTokensOnProtocol({
    tokensToCheck,

    tokensList,
    network,
  }: GetTotalTokensOnProtocolProps) {
    const list = [...new Set(tokensToCheck)];

    const res = await Promise.allSettled(
      list.map(t => PoolPointsAPI.getTokenTotal(t, network, tokensList)),
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

    const url = `https://charts-server.fly.dev/api/getBalanceAt?asset=${token}&chainId=${chainId}`;

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
      const poolAddress = p.pool.pool.address.toLowerCase() as Address;
      const pointsInfo = poolRewards[poolAddress] || [];

      const poolPointsList = pointsInfo.reduce<PoolPointsBase[Address]>(
        (acc, pointsInfo) => {
          const { addr: tokenAddress } = tokensList.get(pointsInfo.token) || {};
          const tokenAddressLower = (
            tokenAddress || ""
          ).toLowerCase() as Address;
          const tokenBalance = totalTokenBalances[tokenAddressLower];

          const points = PoolPointsAPI.getPoolTokenPoints(
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

      acc[poolAddress] = poolPointsList;

      return acc;
    }, {});

    return r;
  }

  private static getPoolTokenPoints(
    tokenBalanceInPool: Asset | undefined,
    pool: MarketSuite,
    tokensList: TokensMeta,
    pointsInfo: PoolPointsInfo<string>,
  ) {
    if (pool.pool.pool.expectedLiquidity <= 0) return 0n;
    if (pointsInfo.estimation === "relative" && !tokenBalanceInPool)
      return null;

    const { decimals = 18 } = tokensList.get(pointsInfo.token) || {};
    const targetFactor = 10n ** BigInt(decimals);

    const defaultPoints =
      (pointsInfo.amount * targetFactor) / PERCENTAGE_FACTOR;
    if (pointsInfo.estimation === "absolute") return defaultPoints;

    const { decimals: underlyingDecimals = 18 } =
      tokensList.get(pool.pool.pool.underlying) || {};
    const underlyingFactor = 10n ** BigInt(underlyingDecimals);

    const points =
      ((tokenBalanceInPool?.balance || 0n) * defaultPoints) /
      ((pool.pool.pool.expectedLiquidity * targetFactor) / underlyingFactor);

    return BigIntMath.min(points, defaultPoints);
  }
}
