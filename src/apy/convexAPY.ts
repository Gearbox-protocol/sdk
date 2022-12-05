import { BigNumber, providers } from "ethers";

import {
  contractParams,
  contractsByNetwork,
  ConvexPoolContract,
  ConvexPoolParams,
} from "../contracts/contracts";
import {
  NetworkType,
  PRICE_DECIMALS,
  SECONDS_PER_YEAR,
  WAD,
} from "../core/constants";
import {
  ConvexPhantomTokenData,
  ConvexStakedPhantomToken,
} from "../tokens/convex";
import { CurveLPToken, CurveLPTokenData } from "../tokens/curveLP";
import {
  SupportedToken,
  supportedTokens,
  tokenDataByNetwork,
} from "../tokens/token";
import {
  IBaseRewardPool,
  IBaseRewardPool__factory,
  IConvexToken,
  IConvexToken__factory,
  ICurvePool,
  ICurvePool__factory,
} from "../types";
import { MCall, multicall } from "../utils/multicall";
import { AwaitedRes } from "../utils/types";
import { CurveAPYResult } from "./curveAPY";

type GetTokenPriceCallback = (
  tokenAddress: string,
  currency?: string,
) => BigNumber;

export interface GetConvexAPYBaseProps {
  provider: providers.Provider;
  networkType: NetworkType;
  getTokenPrice: GetTokenPriceCallback;
  curveAPY: CurveAPYResult;
}

export interface GetConvexAPYBulkProps extends GetConvexAPYBaseProps {
  pools: Array<ConvexPoolContract>;
}

export async function getConvexAPYBulk({
  pools,
  provider,
  networkType,
  getTokenPrice,
  curveAPY,
}: GetConvexAPYBulkProps) {
  const poolsInfo = pools.map(pool => getPoolInfo({ networkType, pool }));

  const calls = poolsInfo.map(
    ([, basePoolAddress, swapPoolAddress, , extraPoolAddresses, tokenList]) =>
      getPoolDataCalls({
        basePoolAddress,
        swapPoolAddress,
        cvxAddress: tokenList.CVX,
        extraPoolAddresses,
      }),
  );

  const response = await multicall<Array<BigNumber>>(calls.flat(1), provider);

  const [parsedResponse] = calls.reduce<[Array<Array<BigNumber>>, number]>(
    ([acc, start], call) => {
      const end = start + call.length;

      const currentResponse = response.slice(start, end);
      acc.push(currentResponse);

      return [acc, end];
    },
    [[], 0],
  );

  const apyList = parsedResponse.map(
    ([basePoolRate, basePoolSupply, vPrice, cvxSupply, ...extra], i) => {
      const [poolParams, , , underlying, extraPoolAddresses, tokenList] =
        poolsInfo[i];

      const apy = calculateConvexAPY({
        basePoolRate,
        basePoolSupply,
        vPrice,
        cvxSupply,
        extra,

        extraPoolAddresses,
        poolParams,
        underlying,

        getTokenPrice,
        curveAPY,
        tokenList,
      });

      return apy;
    },
  );

  return apyList;
}

export interface GetConvexAPYProps extends GetConvexAPYBaseProps {
  pool: ConvexPoolContract;
}

type GetPoolDataReturnType = [
  AwaitedRes<IBaseRewardPool["rewardRate"]>,
  AwaitedRes<IBaseRewardPool["totalSupply"]>,
  AwaitedRes<ICurvePool["get_virtual_price"]>,
  AwaitedRes<IConvexToken["totalSupply"]>,
  ...Array<AwaitedRes<IBaseRewardPool["rewardRate"]>>,
];

export async function getConvexAPY({
  pool,
  provider,
  networkType,
  getTokenPrice,
  curveAPY,
}: GetConvexAPYProps) {
  const [
    poolParams,
    basePoolAddress,
    swapPoolAddress,
    underlying,
    extraPoolAddresses,
    tokenList,
  ] = getPoolInfo({ networkType, pool });

  const calls = getPoolDataCalls({
    basePoolAddress,
    swapPoolAddress,
    cvxAddress: tokenList.CVX,
    extraPoolAddresses,
  });

  const [basePoolRate, basePoolSupply, vPrice, cvxSupply, ...extra] =
    await multicall<GetPoolDataReturnType>(calls, provider);

  const apy = calculateConvexAPY({
    basePoolRate,
    basePoolSupply,
    vPrice,
    cvxSupply,
    extra,

    extraPoolAddresses,
    poolParams,
    underlying,

    getTokenPrice,
    curveAPY,
    tokenList,
  });

  return apy;
}

interface GetPoolInfoProps {
  pool: ConvexPoolContract;
  networkType: NetworkType;
}

function getPoolInfo({ pool, networkType }: GetPoolInfoProps) {
  const tokenList = tokenDataByNetwork[networkType];
  const contractsList = contractsByNetwork[networkType];

  const poolParams = contractParams[pool] as ConvexPoolParams;
  const stakedTokenParams = supportedTokens[
    poolParams.stakedToken
  ] as ConvexPhantomTokenData;

  const { underlying } = stakedTokenParams;
  const basePoolAddress = contractsList[pool];

  const crvParams = supportedTokens[underlying] as CurveLPTokenData;

  const swapPoolAddress = contractsList[crvParams.pool];

  const extraPoolAddresses = poolParams.extraRewards.map(
    d => d.poolAddress[networkType],
  );

  return [
    poolParams,
    basePoolAddress,
    swapPoolAddress,
    underlying,
    extraPoolAddresses,
    tokenList,
  ] as const;
}

type IBaseRewardPoolInterface = IBaseRewardPool["interface"];
type IConvexTokenInterface = IConvexToken["interface"];
type CurveV1AdapterStETHInterface = ICurvePool["interface"];

interface GetPoolDataCallsProps {
  basePoolAddress: string;
  swapPoolAddress: string;
  cvxAddress: string;
  extraPoolAddresses: string[];
}

function getPoolDataCalls({
  basePoolAddress,
  swapPoolAddress,
  cvxAddress,
  extraPoolAddresses,
}: GetPoolDataCallsProps) {
  const calls: [
    MCall<IBaseRewardPoolInterface>,
    MCall<IBaseRewardPoolInterface>,
    MCall<CurveV1AdapterStETHInterface>,
    MCall<IConvexTokenInterface>,
    ...Array<MCall<IBaseRewardPoolInterface>>,
  ] = [
    {
      address: basePoolAddress,
      interface: IBaseRewardPool__factory.createInterface(),
      method: "rewardRate()",
    },
    {
      address: basePoolAddress,
      interface: IBaseRewardPool__factory.createInterface(),
      method: "totalSupply()",
    },
    {
      address: swapPoolAddress,
      interface: ICurvePool__factory.createInterface(),
      method: "get_virtual_price()",
    },
    {
      address: cvxAddress,
      interface: IConvexToken__factory.createInterface(),
      method: "totalSupply()",
    },
    ...extraPoolAddresses.map(
      (extraPoolAddress): MCall<IBaseRewardPoolInterface> => ({
        address: extraPoolAddress,
        interface: IBaseRewardPool__factory.createInterface(),
        method: "rewardRate()",
      }),
    ),
  ];

  return calls;
}

const CVX_MAX_SUPPLY = WAD.mul(100000000);
const CVX_REDUCTION_PER_CLIFF = BigNumber.from(100000);
const CVX_TOTAL_CLIFFS = WAD.mul(1000);

export function getCVXMintAmount(crvAmount: BigNumber, cvxSupply: BigNumber) {
  const currentCliff = cvxSupply.div(CVX_REDUCTION_PER_CLIFF);

  if (currentCliff.lt(CVX_TOTAL_CLIFFS)) {
    const remainingCliffs = CVX_TOTAL_CLIFFS.sub(currentCliff);

    const mintedAmount = crvAmount.mul(remainingCliffs).div(CVX_TOTAL_CLIFFS);

    const amountTillMax = CVX_MAX_SUPPLY.sub(cvxSupply);

    return mintedAmount.gt(amountTillMax) ? amountTillMax : mintedAmount;
  }

  return BigNumber.from(0);
}

export interface CalculateConvexAPYProps {
  basePoolRate: BigNumber;
  basePoolSupply: BigNumber;
  vPrice: BigNumber;
  cvxSupply: BigNumber;
  extra: Array<BigNumber>;

  extraPoolAddresses: string[];
  poolParams: ConvexPoolParams;
  underlying: CurveLPToken;

  getTokenPrice: GetTokenPriceCallback;
  curveAPY: CurveAPYResult;
  tokenList: Record<SupportedToken, string>;
}

const CURRENCY_LIST: Partial<Record<ConvexStakedPhantomToken, SupportedToken>> =
  {
    stkcvxsteCRV: "WETH",
  };

function calculateConvexAPY({
  basePoolRate,
  basePoolSupply,
  vPrice,
  cvxSupply,
  extra,

  extraPoolAddresses,
  poolParams,
  underlying,

  getTokenPrice,
  curveAPY,
  tokenList,
}: CalculateConvexAPYProps) {
  const currencySymbol = CURRENCY_LIST[poolParams.stakedToken];
  const currency = currencySymbol && tokenList[currencySymbol || ""];

  const cvxPrice = getTokenPrice(tokenList.CVX, currency);
  const crvPrice = getTokenPrice(tokenList.CRV, currency);

  const crvPerSecond = basePoolRate;
  const virtualSupply = basePoolSupply.mul(vPrice).div(WAD);
  const crvPerUnderlying = crvPerSecond.mul(WAD).div(virtualSupply);

  const crvPerYear = crvPerUnderlying.mul(SECONDS_PER_YEAR);
  const cvxPerYear = getCVXMintAmount(crvPerYear, cvxSupply);

  const crvAPY = crvPerYear.mul(crvPrice).div(PRICE_DECIMALS);
  const cvxAPY = cvxPerYear.mul(cvxPrice).div(PRICE_DECIMALS);

  const extraAPRs = extraPoolAddresses.map((_, index) => {
    const extraRewardSymbol = poolParams.extraRewards[index].rewardToken;
    const extraPoolRate = extra[index];

    const perUnderlying = extraPoolRate.mul(WAD).div(virtualSupply);
    const perYear = perUnderlying.mul(SECONDS_PER_YEAR);

    const extraPrice = getTokenPrice(tokenList[extraRewardSymbol], currency);

    const extraAPY = perYear.mul(extraPrice).div(PRICE_DECIMALS);

    return extraAPY;
  });

  const extraAPYTotal = extraAPRs.reduce(
    (acc, apy) => acc.add(apy),
    BigNumber.from(0),
  );

  const baseApyWAD = curveAPY[underlying];

  return baseApyWAD.add(crvAPY).add(cvxAPY).add(extraAPYTotal);
}
