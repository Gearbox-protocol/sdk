import {
  decimals,
  NetworkType,
  PartialRecord,
  PERCENTAGE_FACTOR,
  SupportedToken,
  TypedObjectUtils,
} from "@gearbox-protocol/sdk-gov";
import axios from "axios";
import { Address } from "viem";

import { poolByNetwork } from "../contracts/contractsRegister";
import { Asset } from "../core/assets";
import { GearboxBackendApi } from "../core/endpoint";
import { PoolData } from "../core/pool";
import { TokenData } from "../tokens/tokenData";
import { toBN } from "../utils/formatter";
import { BigIntMath } from "../utils/math";
import { GearboxRewardsApy } from "./apy";

export interface GetPointsByPoolProps {
  totalTokenBalances: Record<Address, Asset>;
  pools: Array<PoolData>;
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
  chainId: number;
  network: NetworkType;
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
      // !& ezETH
      // ezETH: {
      //   amount: PERCENTAGE_FACTOR,
      //   symbol: "ezETH",
      //   duration: "hour",
      //   name: "ezPoint",
      // },
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
    },
  },
  Arbitrum: {},
  Optimism: {},
  Base: {},
};

const TOKENS = TypedObjectUtils.entries(POOL_POINTS).reduce<
  Record<NetworkType, Array<SupportedToken>>
>((acc, [network, pools]) => {
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
}, {} as Record<NetworkType, Array<SupportedToken>>);

export class GearboxRewardsExtraApy {
  static async getTotalTokensOnProtocol({
    currentTokenData,
    chainId,
    tokensList,
    network,
  }: GetTotalTokensOnProtocolProps) {
    const currTokens = TOKENS[network];

    const res = await Promise.allSettled(
      currTokens.map(s =>
        this.getTokenTotal(currentTokenData[s], chainId, tokensList),
      ),
    );

    return res.map((r, i): [SupportedToken, PromiseSettledResult<Asset>] => [
      currTokens[i],
      r,
    ]);
  }

  private static async getTokenTotal(
    token: Address,
    chainId: number,
    tokensList: Record<Address, TokenData>,
  ) {
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
    network: NetworkType,
    pool: Address,
    token: SupportedToken,
  ) {
    const p = POOL_POINTS[network]?.[pool]?.[token];
    return p;
  }
}
