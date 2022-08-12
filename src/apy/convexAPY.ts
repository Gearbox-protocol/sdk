import { BigNumber, providers } from "ethers";
import axios from "axios";
import {
  ConvexPoolContract,
  ConvexPoolParams,
  contractsByNetwork,
  contractParams,
  CurvePoolContract
} from "../contracts/contracts";

import { tokenDataByNetwork, supportedTokens } from "../tokens/token";
import { CurveLPToken } from "../tokens/curveLP";
import { ConvexPhantomTokenData } from "../tokens/convex";

import {
  IBaseRewardPool__factory,
  IBaseRewardPool,
  IConvexToken__factory,
  IConvexToken,
  CurveV1AdapterStETH,
  CurveV1AdapterStETH__factory
} from "../types";

import { multicall, MCall } from "../utils/multicall";
import { toBN } from "../utils/formatter";
import { AwaitedRes } from "../utils/types";

import {
  SECONDS_PER_YEAR,
  WAD,
  WAD_DECIMALS_POW,
  NetworkType,
  PRICE_DECIMALS
} from "../core/constants";

type SupportedPools = ConvexPoolContract;

type SupportedCurve = Extract<
  CurvePoolContract,
  | "CURVE_3CRV_POOL"
  | "CURVE_FRAX_POOL"
  | "CURVE_LUSD_POOL"
  | "CURVE_GUSD_POOL"
  | "CURVE_SUSD_POOL"
  | "CURVE_STETH_GATEWAY"
>;

const curvePoolByConvexPool: Record<SupportedPools, SupportedCurve> = {
  CONVEX_3CRV_POOL: "CURVE_3CRV_POOL",
  CONVEX_FRAX3CRV_POOL: "CURVE_FRAX_POOL",
  CONVEX_LUSD3CRV_POOL: "CURVE_LUSD_POOL",
  CONVEX_GUSD_POOL: "CURVE_GUSD_POOL",
  CONVEX_SUSD_POOL: "CURVE_SUSD_POOL",
  CONVEX_STECRV_POOL: "CURVE_STETH_GATEWAY"
};

export async function getConvexApy(
  pool: SupportedPools,
  provider: providers.Provider,
  networkType: NetworkType,
  getTokenPrice: (tokenAddress: string) => BigNumber
) {
  const tokenList = tokenDataByNetwork[networkType];
  const contractsList = contractsByNetwork[networkType];

  const poolParams = contractParams[pool] as ConvexPoolParams;
  const stakedTokenParams = supportedTokens[
    poolParams.stakedToken
  ] as ConvexPhantomTokenData;

  const { underlying } = stakedTokenParams;
  const basePoolAddress = contractsList[pool];
  const swapPoolAddress = contractsList[curvePoolByConvexPool[pool]];
  const cvxAddress = tokenList.CVX;

  const extraPoolAddresses = poolParams.extraRewards.map(
    d => d.poolAddress[networkType]
  );

  const [basePoolRate, basePoolSupply, vPrice, cvxSupply, ...extra] =
    await getPoolData({
      basePoolAddress,
      swapPoolAddress,
      cvxAddress,
      extraPoolAddresses,
      provider
    });

  const cvxPrice = getTokenPrice(tokenList.CVX);
  const crvPrice = getTokenPrice(tokenList.CRV);

  const crvPerSecond = basePoolRate;
  const virtualSupply = basePoolSupply.mul(vPrice).div(WAD);
  const crvPerUnderlying = crvPerSecond.mul(WAD).div(virtualSupply);

  const crvPerYear = crvPerUnderlying.mul(SECONDS_PER_YEAR);
  const cvxPerYear = getCVXMintAmount(crvPerYear, cvxSupply);

  const crvAPY = crvPerYear.mul(crvPrice).div(PRICE_DECIMALS);
  const cvxAPY = cvxPerYear.mul(cvxPrice).div(PRICE_DECIMALS);

  const extraAPRs = await Promise.all(
    extraPoolAddresses.map(async (_, index) => {
      const extraRewardSymbol = poolParams.extraRewards[index].rewardToken;
      const extraPoolRate = extra[index];

      const perUnderlying = extraPoolRate.mul(WAD).div(virtualSupply);
      const perYear = perUnderlying.mul(SECONDS_PER_YEAR);

      const extraPrice = getTokenPrice(tokenList[extraRewardSymbol]);

      const extraAPY = perYear.mul(extraPrice).div(PRICE_DECIMALS);

      return extraAPY;
    })
  );

  const extraAPYTotal = extraAPRs.reduce(
    (acc, apy) => acc.add(apy),
    BigNumber.from(0)
  );

  const baseApyRAY = await getCurveBaseApy(underlying);

  return baseApyRAY.add(crvAPY).add(cvxAPY).add(extraAPYTotal);
}

const CVX_MAX_SUPPLY = WAD.mul(100000000);
const CVX_REDUCTION_PER_CLIFF = BigNumber.from(100000);
const CVX_TOTAL_CLIFFS = WAD.mul(1000);

function getCVXMintAmount(crvAmount: BigNumber, cvxSupply: BigNumber) {
  const currentCliff = cvxSupply.div(CVX_REDUCTION_PER_CLIFF);

  if (currentCliff.lt(CVX_TOTAL_CLIFFS)) {
    const remainingCliffs = CVX_TOTAL_CLIFFS.sub(currentCliff);

    const mintedAmount = crvAmount.mul(remainingCliffs).div(CVX_TOTAL_CLIFFS);

    const amountTillMax = CVX_MAX_SUPPLY.sub(cvxSupply);

    return mintedAmount.gt(amountTillMax) ? amountTillMax : mintedAmount;
  }

  return BigNumber.from(0);
}

type IBaseRewardPoolInterface = IBaseRewardPool["interface"];
type IConvexTokenInterface = IConvexToken["interface"];
type CurveV1AdapterStETHInterface = CurveV1AdapterStETH["interface"];

interface GetPoolDataProps {
  basePoolAddress: string;
  swapPoolAddress: string;
  cvxAddress: string;
  extraPoolAddresses: string[];
  provider: providers.Provider;
}

async function getPoolData({
  basePoolAddress,
  swapPoolAddress,
  cvxAddress,
  extraPoolAddresses,
  provider
}: GetPoolDataProps) {
  const calls: [
    MCall<IBaseRewardPoolInterface>,
    MCall<IBaseRewardPoolInterface>,
    MCall<CurveV1AdapterStETHInterface>,
    MCall<IConvexTokenInterface>,
    ...Array<MCall<IBaseRewardPoolInterface>>
  ] = [
    {
      address: basePoolAddress,
      interface: IBaseRewardPool__factory.createInterface(),
      method: "rewardRate()"
    },
    {
      address: basePoolAddress,
      interface: IBaseRewardPool__factory.createInterface(),
      method: "totalSupply()"
    },
    {
      address: swapPoolAddress,
      interface: CurveV1AdapterStETH__factory.createInterface(),
      method: "get_virtual_price()"
    },
    {
      address: cvxAddress,
      interface: IConvexToken__factory.createInterface(),
      method: "totalSupply()"
    },
    ...extraPoolAddresses.map(
      (extraPoolAddress): MCall<IBaseRewardPoolInterface> => ({
        address: extraPoolAddress,
        interface: IBaseRewardPool__factory.createInterface(),
        method: "rewardRate()"
      })
    )
  ];

  return multicall<
    [
      AwaitedRes<IBaseRewardPool["rewardRate"]>,
      AwaitedRes<IBaseRewardPool["totalSupply"]>,
      AwaitedRes<CurveV1AdapterStETH["get_virtual_price"]>,
      AwaitedRes<IConvexToken["totalSupply"]>,
      ...Array<AwaitedRes<IBaseRewardPool["rewardRate"]>>
    ]
  >(calls, provider);
}

interface CurveAPRData {
  baseApy: number;
  crvApy: number;
  crvBoost: number;
  crvPrice: number;
}

interface APYResponse {
  apys: Record<string, CurveAPRData>;
}

const curveLPTokenToPoolName: Record<CurveLPToken, string> = {
  "3Crv": "3pool",
  FRAX3CRV: "frax",
  gusd3CRV: "gusd",
  LUSD3CRV: "lusd",
  crvPlain3andSUSD: "susdv2",
  steCRV: "steth"
};

const RESPONSE_DECIMALS = 100;

// https://www.convexfinance.com/api/curve-apys

export async function getCurveBaseApy(
  curveLPToken: CurveLPToken
): Promise<BigNumber> {
  const poolName = curveLPTokenToPoolName[curveLPToken];

  try {
    const url = "https://www.convexfinance.com/api/curve-apys";
    const result = await axios.get<APYResponse>(url);

    const { baseApy = 0 } = result.data.apys[poolName] || {};

    return toBN((baseApy / RESPONSE_DECIMALS).toString(), WAD_DECIMALS_POW);
  } catch (e) {
    return BigNumber.from(0);
  }
}
