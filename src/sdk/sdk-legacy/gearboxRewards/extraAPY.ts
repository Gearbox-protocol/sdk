import axios from "axios";
import type { Address } from "viem";

import { chains, type NetworkType } from "../../chain";
import { PERCENTAGE_FACTOR } from "../../constants";
import type { Asset } from "../../router";
import type { SupportedToken } from "../../sdk-gov-legacy";
import { type PartialRecord, TypedObjectUtils } from "../../utils";
import { poolByNetwork } from "../contracts/contractsRegister";
import { GearboxBackendApi } from "../core/endpoint";
import type { PoolData_Legacy } from "../core/pool";
import type { TokenData } from "../tokens/tokenData";
import { toBN } from "../utils/formatter";
import { BigIntMath } from "../utils/math";

export interface GetPointsByPoolProps {
  totalTokenBalances: Record<Address, Asset>;
  pools: Array<PoolData_Legacy>;
  currentTokenData: Record<SupportedToken, Address>;
  tokensList: Record<Address, TokenData>;
  network: NetworkType;
}

interface WalletResult {
  borrower: Address;
  effective_balance: number;
}

interface GetBalanceAtResponse {
  result: Array<WalletResult>;
}

export interface GetTotalTokensOnProtocolProps {
  currentTokenData: Record<SupportedToken, Address>;
  tokensList: Record<Address, TokenData>;
  network: NetworkType;

  extraTokens?: Array<SupportedToken>;
}

interface PoolPointsInfo {
  amount: bigint;
  symbol: SupportedToken;
  duration: string;
  name: string;
  estimation: "absolute" | "relative";
}

const POOL_POINTS: Record<
  NetworkType,
  Record<Address, PartialRecord<SupportedToken, PoolPointsInfo>>
> = {
  Mainnet: {
    [poolByNetwork.Mainnet.WETH_V3_TRADE]: {
      rsETH: {
        amount: 7500n * 10000n,
        symbol: "rsETH",
        duration: "hour",
        name: "Kelp Mile",
        estimation: "relative",
      },
    },
    [poolByNetwork.Mainnet.WBTC_V3_TRADE]: {
      LBTC: {
        amount: 2000n * 10000n,
        symbol: "LBTC",
        duration: "day",
        name: "Lombard LUX",
        estimation: "absolute",
      },
      pumpBTC: {
        amount: 172_800n * 10000n,
        symbol: "pumpBTC",
        duration: "day",
        name: "Pump BTC",
        estimation: "absolute",
      },
    },
  },
  Arbitrum: {},
  Optimism: {},
  Base: {},
};

const TOKENS = TypedObjectUtils.entries(POOL_POINTS).reduce<
  Record<NetworkType, Array<SupportedToken>>
>(
  (acc, [network, pools]) => {
    const r = Object.values(pools).reduce<Array<SupportedToken>>(
      (acc, tokens) => {
        const l = Object.keys(tokens) as Array<SupportedToken>;
        acc.push(...l);
        return acc;
      },
      [],
    );

    acc[network] = r;

    return acc;
  },
  {} as Record<NetworkType, Array<SupportedToken>>,
);

const CA_REWARDS: Record<NetworkType, Array<SupportedToken>> = {
  Mainnet: [],
  Arbitrum: [],
  Optimism: ["ezETH"],
  Base: [],
};

export class GearboxRewardsExtraApy {
  static async getTotalTokensOnProtocol({
    currentTokenData,
    tokensList,
    network,

    extraTokens = [],
  }: GetTotalTokensOnProtocolProps) {
    const poolTokens = TOKENS[network];
    const caTokens = CA_REWARDS[network];

    const list = [...new Set([...poolTokens, ...caTokens, ...extraTokens])];

    const res = await Promise.allSettled(
      list.map(s =>
        this.getTokenTotal(currentTokenData[s], network, tokensList),
      ),
    );

    return res.map((r, i): [SupportedToken, PromiseSettledResult<Asset>] => [
      list[i],
      r,
    ]);
  }

  private static async getTokenTotal(
    token: Address,
    network: NetworkType,
    tokensList: Record<Address, TokenData>,
  ) {
    const chain = chains[network];

    const url = GearboxBackendApi.getChartsUrl("getBalanceAt", chain.id, {
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
    totalTokenBalances,
    pools,
    tokensList,
    currentTokenData,
    network,
  }: GetPointsByPoolProps) {
    const r = pools.reduce<Record<Address, Array<Asset>>>((acc, p) => {
      const poolPointsInfo = Object.values(
        POOL_POINTS[network]?.[p.address] || [],
      );

      const poolPointsList = poolPointsInfo.reduce<Array<Asset>>(
        (acc, pointsInfo) => {
          const tokenBalance =
            totalTokenBalances[currentTokenData[pointsInfo.symbol] || ""];

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
    pool: PoolData_Legacy,
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
    network: NetworkType,
    pool: Address,
    token: SupportedToken,
  ) {
    const p = POOL_POINTS[network]?.[pool]?.[token];
    return p;
  }
}
