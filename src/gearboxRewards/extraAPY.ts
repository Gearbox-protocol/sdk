import {
  decimals,
  NetworkType,
  PartialRecord,
  PERCENTAGE_FACTOR,
  SupportedToken,
  TypedObjectUtils,
} from "@gearbox-protocol/sdk-gov";
import axios from "axios";

import { poolByNetwork } from "../contracts/contractsRegister";
import { Asset } from "../core/assets";
import { ChartsApi } from "../core/endpoint";
import { PoolData } from "../core/pool";
import { TokenData } from "../tokens/tokenData";
import { toBN } from "../utils/formatter";
import { BigIntMath } from "../utils/math";
import { GearboxRewardsApy } from "./apy";

export interface GetPointsByPoolProps {
  totalTokenBalances: Record<string, Asset>;
  pools: Array<PoolData>;
  currentTokenData: Record<SupportedToken, string>;
  tokensList: Record<string, TokenData>;
  network: NetworkType;
}

interface WalletResult {
  borrower: string;
  effective_balance: number;
}

interface GetBalanceAtResponse {
  result: Array<WalletResult>;
}

export interface GetTotalTokensOnProtocolProps {
  currentTokenData: Record<SupportedToken, string>;
  tokensList: Record<string, TokenData>;
  chainId: number;
  network: NetworkType;
}

interface PoolPointsInfo {
  amount: bigint;
  symbol: SupportedToken;
  duration: string;
  name: string;
}

const POOL_POINTS: Record<
  NetworkType,
  Record<string, PartialRecord<SupportedToken, PoolPointsInfo>>
> = {
  Mainnet: {
    [poolByNetwork.Mainnet.WETH_V3_TRADE]: {
      // !& ezeth
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
      },
    },
  },
  Arbitrum: {
    // [poolByNetwork.Arbitrum.WETH_V3]: {
    //   ezETH: {
    //     amount: PERCENTAGE_FACTOR,
    //     symbol: "ezETH",
    //     duration: "hour",
    //     name: "ezPoint",
    //   },
    // },
  },
  Optimism: {},
  Base: {},
};

// !& + STETH
const TOKENS = TypedObjectUtils.fromEntries(
  TypedObjectUtils.entries(POOL_POINTS).map(([network, pools]) => {
    const r = Object.values(pools)
      .map(tokens => {
        const l = Object.keys(tokens) as Array<SupportedToken>;
        return l;
      })
      .flat(1);

    return [network, r];
  }),
);

const REWARD = toBN("7.7", decimals.wstETH);
const REWARD_PERIOD = BigInt(30 * 24 * 60 * 60);

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
    token: string,
    chainId: number,
    tokensList: Record<string, TokenData>,
  ) {
    const url = ChartsApi.getUrl("getBalanceAt", chainId, {
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
    const r = Object.fromEntries(
      pools.map(p => {
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

        return [p.address, poolPointsList];
      }),
    );

    return r;
  }

  private static getPoolTokenPoints(
    tokenBalanceInPool: Asset | undefined,
    pool: PoolData,
    tokensList: Record<string, TokenData>,
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
      (tokenBalanceInPool.balance * defaultPoints) /
      ((pool.expectedLiquidity * targetFactor) / underlyingFactor);

    return BigIntMath.min(points, defaultPoints);
  }

  static getPoolPointsTip(
    network: NetworkType,
    pool: string,
    token: SupportedToken,
  ) {
    const p = POOL_POINTS[network]?.[pool]?.[token];
    return p;
  }

  static getExtraLidoAPY = (
    supply: bigint,
    supplyPrice: bigint,
    rewardPrice: bigint,
    currentTimestamp: number,
  ) =>
    GearboxRewardsApy.calculateAPY_V3({
      info: {
        balance: 0n,
        duration: REWARD_PERIOD,
        // !& + STETH
        finished: BigInt(Math.floor(Date.now() / 1000) + 10000),
        reward: REWARD,
        symbol: "STETH",
      },
      supply: {
        amount: supply,
        decimals: decimals.wstETH,
        price: supplyPrice,
      },
      reward: {
        price: rewardPrice,
        decimals: decimals.wstETH,
      },
      currentTimestamp,
    });
}
