import { BigNumber, providers } from "ethers";
import { detectNetwork } from "../utils/network";
import axios from "axios";
import {
  ConvexPoolContract,
  ConvexPoolParams,
  contractsByNetwork,
  contractParams
} from "../contracts/contracts";
import { IBaseRewardPool } from "../types/contracts/integrations/convex/IBaseRewardPool";
import { IConvexToken } from "../types/contracts/integrations/convex/IConvexToken";

import {
  tokenDataByNetwork,
  supportedTokens,
  SupportedToken
} from "../tokens/token";
import { CurveLPToken } from "../tokens/curveLP";
import { ConvexPhantomTokenData } from "../tokens/convex";

import {
  IBaseRewardPool__factory,
  IConvexToken__factory,
  PriceOracle,
  CurveV1AdapterBase__factory
} from "../types";

import { multicall, MCall } from "../utils/multicall";
import { toBN, toSignificant } from "../utils/formatter";

import { SECONDS_PER_YEAR, WAD, RAY, ADDRESS_0x0 } from "../core/constants";
import { stringify } from "querystring";

interface CurveAPRData {
  baseApy: number;
  crvApy: number;
  crvBoost: number;
  crvPrice: number;
}

interface APYResponse {
  apys: Record<string, CurveAPRData>;
}

const CVX_MAX_SUPPLY = WAD.mul(10 ** 8);
const CVX_REDUCTION_PER_CLIFF = WAD.mul(10 ** 5);
const CVX_TOTAL_CLIFFS = BigNumber.from(1000);

const curveLPTokenToPoolName: Record<CurveLPToken, string> = {
  "3Crv": "3pool",
  FRAX3CRV: "frax",
  gusd3CRV: "gusd",
  LUSD3CRV: "lusd",
  crvPlain3andSUSD: "susdv2",
  steCRV: "steth"
};

export async function getConvexApyRAY(
  pool: ConvexPoolContract,
  provider: providers.Provider,
  priceOracle: PriceOracle,
  getTokenPrice: (token: SupportedToken) => BigNumber
) {
  const poolParams = contractParams[pool] as ConvexPoolParams;
  const stakedTokenParams = supportedTokens[
    poolParams.stakedToken
  ] as ConvexPhantomTokenData;
  const underlying = stakedTokenParams.underlying;

  const networkType = await detectNetwork(provider);

  const basePoolAddress = contractsByNetwork[networkType][pool];
  const tokenList = tokenDataByNetwork[networkType];
  const cvxAddress = tokenList.CVX;

  const zzzz = CurveV1AdapterBase__factory.connect(
    tokenList[underlying],
    provider
  );
  const vvvv = await zzzz.get_virtual_price();

  const extraPoolAddresses = poolParams.extraRewards.map(d => {
    return d.poolAddress[networkType];
  });

  const poolData = await getPoolData(
    basePoolAddress,
    cvxAddress,
    extraPoolAddresses,
    provider
  );
  if (poolData.length != 3 + extraPoolAddresses.length)
    throw "Convex APY: Incorrect number of results when fetching pool data";

  const [basePoolRate, basePoolSupply, cvxSupply] = poolData;

  const crvPerSecond = basePoolRate;
  const cvxPerSecond = getCVXMintAmount(crvPerSecond, cvxSupply);
  console.log(
    crvPerSecond.toString(),
    crvPerSecond.toString().length,
    cvxSupply.toString(),
    cvxSupply.toString().length
  );

  const [cvxPrice, crvPrice] = await getPrice(
    [tokenList.CVX, tokenList.CRV],
    "usd"
  );

  const safeCrvPrice = toBN(crvPrice.toString(), 18);
  const safeCvxPrice = toBN(cvxPrice.toString(), 18);

  const crvPerUnderlyingPerYearRAY = crvPerSecond
    .mul(RAY)
    .mul(SECONDS_PER_YEAR)
    .div(basePoolSupply);
  const crvApyRAY = crvPerUnderlyingPerYearRAY.mul(safeCrvPrice).div(vvvv);

  const cvxPerUnderlyingPerYearRAY = cvxPerSecond
    .mul(RAY)
    .mul(SECONDS_PER_YEAR)
    .div(basePoolSupply);
  const cvxApyRAY = cvxPerUnderlyingPerYearRAY.mul(safeCvxPrice).div(vvvv);

  let totalExtraApyRAY = BigNumber.from(0);

  for (let i = 0; i < extraPoolAddresses.length; i++) {
    const extraReward = poolParams.extraRewards[i].rewardToken;

    const extraPoolRate = poolData[3 + i];
    const extraPoolSupply = basePoolSupply;

    const extraPerUnderlyingPerYearRAY = extraPoolRate
      .mul(RAY)
      .mul(SECONDS_PER_YEAR)
      .div(extraPoolSupply);

    const [price] = await getPrice([tokenList[extraReward]], "usd");
    const safePrice = toBN(price.toString(), 18);

    const extraApyRAY = extraPerUnderlyingPerYearRAY
      .mul(safePrice)
      .div(getTokenPrice(underlying));

    totalExtraApyRAY = totalExtraApyRAY.add(extraApyRAY);
  }

  const baseApyRAY = await getCurveBaseApy(underlying);

  console.log(
    "v2",
    toSignificant(baseApyRAY, 27),
    toSignificant(crvApyRAY, 27),
    toSignificant(cvxApyRAY, 27),
    toSignificant(totalExtraApyRAY, 27)
  );

  return baseApyRAY.add(crvApyRAY).add(cvxApyRAY).add(totalExtraApyRAY);
}

function getCVXMintAmount(amount: BigNumber, cvxSupply: BigNumber) {
  const cliff = cvxSupply.div(CVX_REDUCTION_PER_CLIFF);

  if (cliff.lt(CVX_TOTAL_CLIFFS)) {
    const reduction = CVX_TOTAL_CLIFFS.sub(cliff);
    const mintedAmount = amount.mul(reduction).div(CVX_TOTAL_CLIFFS);

    console.log("mintedAmount", mintedAmount.toString());

    return mintedAmount < CVX_MAX_SUPPLY.sub(cvxSupply)
      ? mintedAmount
      : CVX_MAX_SUPPLY.sub(cvxSupply);
  }

  return BigNumber.from(0);
}

export async function getPrice(
  contractAddress: Array<string>,
  vsCoin: string
): Promise<Array<number>> {
  const url = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractAddress.join(
    ","
  )}&vs_currencies=${vsCoin}`;

  const result = await axios.get(url);

  return contractAddress.map(
    a => result.data[a.toLowerCase()][vsCoin.toLowerCase()] || 0
  );
}

async function getPoolData(
  basePoolAddress: string,
  cvxAddress: string,
  extraPoolAddresses: string[],
  provider: providers.Provider
) {
  const calls: Array<MCall<any>> = [
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
      address: cvxAddress,
      interface: IConvexToken__factory.createInterface(),
      method: "totalSupply()"
    }
  ];

  for (const extraPoolAddress of extraPoolAddresses) {
    calls.push({
      address: extraPoolAddress,
      interface: IBaseRewardPool__factory.createInterface(),
      method: "rewardRate()"
    });
  }

  return multicall<
    [
      Awaited<ReturnType<IBaseRewardPool["rewardRate"]>>,
      Awaited<ReturnType<IBaseRewardPool["totalSupply"]>>,
      Awaited<ReturnType<IConvexToken["totalSupply"]>>,
      ...Array<Awaited<ReturnType<IBaseRewardPool["rewardRate"]>>>
    ]
  >(calls, provider);
}

// https://www.convexfinance.com/api/curve-apys

export async function getCurveBaseApy(
  curveLPToken: CurveLPToken
): Promise<BigNumber> {
  const poolName = curveLPTokenToPoolName[curveLPToken];

  try {
    const url = "http://localhost:8000/api/curve-apys";
    const result = await axios.get<APYResponse>(url);

    const { baseApy = 0 } = result.data.apys[poolName.toLowerCase()] || {};

    return toBN(baseApy.toString(), 27);
  } catch (e) {
    return BigNumber.from(0);
  }
}

export function getRewards(pool: ConvexPoolContract): Array<SupportedToken> {
  return [
    "CRV",
    "CVX",
    ...(contractParams[pool] as ConvexPoolParams).extraRewards.map(d => {
      d.rewardToken;
    })
  ] as Array<SupportedToken>;
}
