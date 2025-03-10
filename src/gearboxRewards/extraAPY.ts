import type { NetworkType } from "@gearbox-protocol/sdk-gov";
import { CHAINS, PERCENTAGE_FACTOR } from "@gearbox-protocol/sdk-gov";
import axios from "axios";
import type { Address } from "viem";

import type { Asset } from "../core/assets";
import { GearboxBackendApi } from "../core/endpoint";
import type { PoolData } from "../core/pool";
import type { TokenData } from "../tokens/tokenData";
import { toBN } from "../utils/formatter";
import { BigIntMath } from "../utils/math";

export interface PoolPointsInfo {
  pool: Address;
  token: Address;
  symbol: string;

  amount: bigint;
  duration: string;
  name: string;
  estimation: "absolute" | "relative";
}

export interface GetPointsByPoolProps {
  poolRewards: Record<Address, Record<Address, PoolPointsInfo>>;

  totalTokenBalances: Record<Address, Asset>;
  pools: Array<PoolData>;
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

export class GearboxRewardsExtraApy {
  static async getTotalTokensOnProtocol({
    tokensToCheck,

    tokensList,
    network,
  }: GetTotalTokensOnProtocolProps) {
    const list = [...new Set(tokensToCheck)];

    const res = await Promise.allSettled(
      list.map(t => this.getTokenTotal(t, network, tokensList)),
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
    const chainId = CHAINS[network];

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
    const r = pools.reduce<Record<Address, Array<Asset>>>((acc, p) => {
      const pointsInfo = Object.values(poolRewards[p.address] || {});

      const poolPointsList = pointsInfo.reduce<Array<Asset>>(
        (acc, pointsInfo) => {
          const { address: tokenAddress } = tokensList[pointsInfo.token];
          const tokenBalance = totalTokenBalances[tokenAddress || ""];

          const points = this.getPoolTokenPoints(
            tokenBalance,
            p,
            tokensList,
            pointsInfo,
          );

          if (points !== null) {
            acc.push({ balance: points, token: tokenBalance.token });
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
    pool: PoolData,
    tokensList: Record<Address, TokenData>,
    pointsInfo: PoolPointsInfo,
  ) {
    if (!tokenBalanceInPool) return null;
    if (pool.expectedLiquidity <= 0) return 0n;
    const { decimals = 18 } = tokensList[tokenBalanceInPool.token] || {};
    const targetFactor = 10n ** BigInt(decimals);

    const { decimals: underlyingDecimals = 18 } =
      tokensList[pool.underlyingToken] || {};
    const underlyingFactor = 10n ** BigInt(underlyingDecimals);

    const defaultPoints =
      (pointsInfo.amount * targetFactor) / PERCENTAGE_FACTOR;

    const points =
      pointsInfo.estimation === "absolute"
        ? defaultPoints
        : (tokenBalanceInPool.balance * defaultPoints) /
          ((pool.expectedLiquidity * targetFactor) / underlyingFactor);

    return BigIntMath.min(points, defaultPoints);
  }

  static getPoolPointsTip(
    poolRewards: Record<Address, Record<Address, PoolPointsInfo>>,
    pool: Address,
    token: Address,
  ) {
    const p = poolRewards[pool]?.[token];
    return p;
  }
}
