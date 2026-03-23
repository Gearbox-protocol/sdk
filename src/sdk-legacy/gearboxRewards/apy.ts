import type { Address } from "viem";

import {
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  RAY,
  SECONDS_PER_YEAR,
  WAD,
} from "../../constants/index.js";
import type { Asset } from "../../router/index.js";
import { toBigInt } from "../../utils/index.js";
import type { PoolData_Legacy } from "../core/pool.js";
import type { TokenData } from "../tokens/tokenData.js";
import { PriceUtils } from "../utils/price.js";

export interface FarmInfo {
  pool: Address;
  finished: bigint;
  duration: bigint;
  reward: bigint;

  balance: bigint;
  symbol: string;
  token: Address;
}

interface CalculateV3PoolLmAPYProps {
  currentTimestamp: number;
  info: FarmInfo;

  supply: {
    decimals: number;
    amount: bigint;
    price: bigint;
  };

  reward: {
    decimals: number;
    price: bigint;
  };
}

const PERCENTAGE_FACTOR_1KK = PERCENTAGE_DECIMALS * PERCENTAGE_FACTOR;
const ONE = PERCENTAGE_FACTOR_1KK * 10n;

export interface ExtraRewardApy {
  token: Address;
  balance: bigint | null;

  apy: number;
  rewardToken: Address;
  rewardTokenSymbol: string;

  endTimestamp?: number;
}

interface GetPoolExtraAPY_V3Props {
  stakedDieselToken: Address | undefined;
  pool: PoolData_Legacy;
  prices: Record<Address, bigint>;

  rewardPoolsInfo: Record<Address, Array<FarmInfo>> | Record<Address, FarmInfo>;
  rewardPoolsSupply: Record<Address, bigint>;

  tokensList: Record<Address, TokenData>;

  currentTimestamp: number;
}

interface GetPoolExtraLmAPYProps
  extends Omit<
    GetPoolExtraAPY_V3Props,
    "rewardPoolsInfo" | "stakedDieselToken"
  > {
  stakedDieselToken: Address;
  rewardPoolsInfo: FarmInfo;
}

interface GetCAExtraAPYProps {
  assets: Array<Asset>;
  supply: Record<Address, bigint> | Record<Address, Asset>;
  rewardInfo: Record<Address, Array<FarmInfo>>;
  currentTimestamp: number;

  prices: Record<Address, bigint>;
  tokensList: Record<Address, TokenData>;
}

interface GetCASingleExtraAPYProps
  extends Omit<GetCAExtraAPYProps, "rewardInfo" | "assets"> {
  asset: Asset;
  rewardInfo: FarmInfo;
}

export class GearboxRewardsApy {
  static getPoolExtraAPY_V3({
    rewardPoolsInfo,
    stakedDieselToken,
    ...restProps
  }: GetPoolExtraAPY_V3Props): Array<ExtraRewardApy> {
    const { version } = restProps.pool;
    const isV3 = version >= 300 && version < 400;
    if (!isV3 || !stakedDieselToken) return [];

    const info = rewardPoolsInfo[stakedDieselToken];
    if (!info) return [];

    const extra = (Array.isArray(info) ? info : [info]).map(inf =>
      GearboxRewardsApy.getPoolSingleExtraLmAPY_V3({
        ...restProps,
        stakedDieselToken,
        rewardPoolsInfo: inf,
      }),
    );

    return extra;
  }

  private static getPoolSingleExtraLmAPY_V3({
    stakedDieselToken,
    pool,
    prices,

    rewardPoolsInfo,
    rewardPoolsSupply,

    tokensList,

    currentTimestamp,
  }: GetPoolExtraLmAPYProps): ExtraRewardApy {
    const { underlyingToken, dieselRateRay } = pool;

    const safeSupply = rewardPoolsSupply[stakedDieselToken] ?? 0n;

    const { decimals: underlyingDecimals = 18 } =
      tokensList[underlyingToken] || {};
    const underlyingPrice = prices[underlyingToken] ?? 0n;
    const dieselPrice = (underlyingPrice * dieselRateRay) / RAY;

    const rewardAddress = rewardPoolsInfo?.token || "";
    const { decimals: rewardDecimals = 18 } = tokensList[rewardAddress] || {};
    const rewardPrice = prices[rewardAddress] ?? 0n;

    const r =
      GearboxRewardsApy.calculateAPY_V3({
        currentTimestamp,
        info: rewardPoolsInfo,
        supply: {
          amount: safeSupply,
          decimals: underlyingDecimals,
          price: dieselPrice,
        },
        reward: {
          price: rewardPrice,
          decimals: rewardDecimals,
        },
      }) / Number(PERCENTAGE_FACTOR);

    return {
      token: stakedDieselToken,
      balance: null,

      apy: r,
      rewardToken: rewardAddress,
      rewardTokenSymbol: rewardPoolsInfo.symbol,
    };
  }

  private static calculateAPY_V3({
    info,
    supply,
    reward,
    currentTimestamp,
  }: CalculateV3PoolLmAPYProps) {
    const finished = info.finished <= currentTimestamp;
    if (finished) return 0;

    if (supply.amount <= 0n) return 0;
    if (supply.price === 0n || reward.price === 0n) return 0;
    if (info.duration === 0n) return 0;

    const supplyMoney = PriceUtils.calcTotalPrice(
      supply.price,
      supply.amount,
      supply.decimals,
    );

    const rewardMoney = PriceUtils.calcTotalPrice(
      reward.price,
      info.reward,
      reward.decimals,
    );

    const durationRatio = (toBigInt(SECONDS_PER_YEAR) * WAD) / info.duration;

    const apyBn = (((rewardMoney * ONE) / supplyMoney) * durationRatio) / WAD;

    return Math.round(Number(apyBn) / 10);
  }

  static getCAExtraAPY_V3({
    rewardInfo,
    assets,
    ...restProps
  }: GetCAExtraAPYProps): Array<ExtraRewardApy> {
    const extra = assets.reduce(
      (acc, asset) => {
        const { token } = asset;
        const info = rewardInfo[token || ""];

        if (!info || info.length === 0) return acc;

        const extra = info.map(inf =>
          GearboxRewardsApy.getCASingleExtraAPY_V3({
            ...restProps,
            asset,
            rewardInfo: inf,
          }),
        );

        acc.push(...extra);

        return acc;
      },
      [] as Array<ExtraRewardApy>,
    );

    return extra;
  }

  private static getCASingleExtraAPY_V3({
    asset,
    prices,
    rewardInfo,
    supply,

    tokensList,

    currentTimestamp,
  }: GetCASingleExtraAPYProps): ExtraRewardApy {
    const { token, balance } = asset;

    const safeSupply = supply[token] ?? 0n;

    const { decimals: tokenDecimals = 18 } = tokensList[token] || {};
    const tokenPrice = prices[token] ?? 0n;

    const rewardAddress = rewardInfo?.token || "";
    const { decimals: rewardDecimals = 18 } = tokensList[rewardAddress] || {};
    const rewardPrice = prices[rewardAddress] ?? 0n;

    const r =
      GearboxRewardsApy.calculateAPY_V3({
        currentTimestamp,
        info: rewardInfo,
        supply: {
          amount:
            typeof safeSupply === "bigint" ? safeSupply : safeSupply.balance,
          decimals: tokenDecimals,
          price: tokenPrice,
        },
        reward: {
          price: rewardPrice,
          decimals: rewardDecimals,
        },
      }) / Number(PERCENTAGE_FACTOR);

    return {
      token,
      balance,

      apy: r,
      rewardToken: rewardAddress,
      rewardTokenSymbol: rewardInfo.symbol,
    };
  }
}
