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
import { ConvexPhantomTokenData } from "../tokens/convex";
import { CurveLPTokenData } from "../tokens/curveLP";
import { supportedTokens, tokenDataByNetwork } from "../tokens/token";
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

export interface GetConvexAPYProps {
  pool: ConvexPoolContract;
  provider: providers.Provider;
  networkType: NetworkType;
  getTokenPrice: (tokenAddress: string) => BigNumber;
  curveAPY: CurveAPYResult;
}

export async function getConvexAPY({
  pool,
  provider,
  networkType,
  getTokenPrice,
  curveAPY,
}: GetConvexAPYProps) {
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
  const cvxAddress = tokenList.CVX;

  const extraPoolAddresses = poolParams.extraRewards.map(
    d => d.poolAddress[networkType],
  );

  const [basePoolRate, basePoolSupply, vPrice, cvxSupply, ...extra] =
    await getPoolData({
      basePoolAddress,
      swapPoolAddress,
      cvxAddress,
      extraPoolAddresses,
      provider,
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
    }),
  );

  const extraAPYTotal = extraAPRs.reduce(
    (acc, apy) => acc.add(apy),
    BigNumber.from(0),
  );

  const baseApyWAD = curveAPY[underlying];

  return baseApyWAD.add(crvAPY).add(cvxAPY).add(extraAPYTotal);
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
type CurveV1AdapterStETHInterface = ICurvePool["interface"];

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
  provider,
}: GetPoolDataProps) {
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

  return multicall<
    [
      AwaitedRes<IBaseRewardPool["rewardRate"]>,
      AwaitedRes<IBaseRewardPool["totalSupply"]>,
      AwaitedRes<ICurvePool["get_virtual_price"]>,
      AwaitedRes<IConvexToken["totalSupply"]>,
      ...Array<AwaitedRes<IBaseRewardPool["rewardRate"]>>,
    ]
  >(calls, provider);
}
