import {
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  RAY,
  SECONDS_PER_YEAR,
  SupportedToken,
  toBigInt,
  WAD,
} from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { PoolData } from "../core/pool";
import { TokenData } from "../tokens/tokenData";
import { PriceUtils } from "../utils/price";
import { FarmInfo } from "./api";

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

export interface PoolExtraRewardApy {
  symbol: SupportedToken;
  apy: number;
}

interface GetPoolExtraAPY_V3Props {
  stakedDieselToken: Address | undefined;
  pool: PoolData;
  prices: Record<Address, bigint>;

  rewardPoolsInfo: Record<Address, Array<FarmInfo>>;
  rewardPoolsSupply: Record<Address, bigint>;

  tokensList: Record<Address, TokenData>;
  currentTokenData: Record<SupportedToken, Address>;

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

export class GearboxRewardsApy {
  static getPoolExtraAPY_V3({
    rewardPoolsInfo,
    stakedDieselToken,
    ...restProps
  }: GetPoolExtraAPY_V3Props): Array<PoolExtraRewardApy> {
    const { version } = restProps.pool;
    const isV3 = version >= 300 && version < 400;
    if (!isV3 || !stakedDieselToken) return [];

    const info = rewardPoolsInfo[stakedDieselToken];
    if (!info) return [];

    const extra = info.map(inf =>
      this.getPoolSingleExtraLmAPY_V3({
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
    currentTokenData,

    currentTimestamp,
  }: GetPoolExtraLmAPYProps): PoolExtraRewardApy {
    const { underlyingToken, dieselRateRay } = pool;

    const safeSupply = rewardPoolsSupply[stakedDieselToken] ?? 0n;

    const { decimals: underlyingDecimals = 18 } =
      tokensList[underlyingToken] || {};
    const underlyingPrice = prices[underlyingToken] ?? 0n;
    const dieselPrice = (underlyingPrice * dieselRateRay) / RAY;

    const rewardAddress = currentTokenData[rewardPoolsInfo.symbol];
    const { decimals: rewardDecimals = 18 } = tokensList[rewardAddress] || {};
    const rewardPrice = prices[rewardAddress] ?? 0n;

    const r =
      this.calculateAPY_V3({
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

    return { symbol: rewardPoolsInfo.symbol, apy: r };
  }

  static calculateAPY_V3({
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
}