import { BigNumber, providers } from "ethers";
import { detectNetwork } from "../utils/network";
import axios from "axios";
import {
    ConvexPoolContract,
    ConvexPoolParams,
    contractsByNetwork,
    contractParams
} from "../contracts/contracts";
import {
    tokenDataByNetwork,
    supportedTokens,
    SupportedToken
} from "../tokens/token";
import {
    CurveLPToken
} from "../tokens/curveLP";
import {
    ConvexPhantomTokenData
} from "../tokens/convex";

import {
    IBaseRewardPool__factory,
    IConvexToken__factory
} from "../types"

import { multicall, MCall } from "../utils/multicall";

import { SECONDS_PER_YEAR, WAD, RAY } from "../core/constants";

interface CurveAPRData {
    baseApy: number,
    crvApy: number,
    crvBoost: number,
    crvPrice: number
}

interface APYResponse {
  apys: Record<string, CurveAPRData>;
}

const CVX_MAX_SUPPLY = WAD.mul(10 ** 8);
const CVX_REDUCTION_PER_CLIFF = WAD.mul(10 ** 5);
const CVX_TOTAL_CLIFFS = BigNumber.from(1000);

const curveLPTokenToPoolName: Record<CurveLPToken, string> = {
    "3Crv": "3pool",
    "FRAX3CRV": "frax",
    "gusd3CRV": "gusd",
    "LUSD3CRV": "lusd",
    "crvPlain3andSUSD": "susdv2",
    "steCRV": "steth"
}

export async function getConvexApyRAY(
    pool: ConvexPoolContract,
    provider: providers.Provider,
    getTokenPrice: (token: SupportedToken) => BigNumber
) {

    const poolParams = contractParams[pool] as ConvexPoolParams;
    const stakedTokenParams = supportedTokens[poolParams.stakedToken] as ConvexPhantomTokenData;
    const underlying = stakedTokenParams.underlying;

    const networkType = await detectNetwork(provider);

    const basePoolAddress = contractsByNetwork[networkType][pool];
    const cvxAddress = tokenDataByNetwork[networkType].CVX;

    const extraPoolAddresses = poolParams.extraRewards.map((d) => {
        return d.poolAddress[networkType]
    });

    const poolData = await getPoolData(
        basePoolAddress,
        cvxAddress,
        extraPoolAddresses,
        provider
    );

    if (poolData.length != 3 + extraPoolAddresses.length) {
        throw("Convex APY: Incorrect number of results when fetching pool data");
    }

    const basePoolRate = poolData[0];
    const basePoolSupply = poolData[1];
    const cvxSupply = poolData[2];

    const crvPerSecond = basePoolRate;
    const cvxPerSecond = await getCVXMintAmount(crvPerSecond, cvxSupply);

    const crvPerUnderlyingPerYearRAY = crvPerSecond.mul(RAY).mul(SECONDS_PER_YEAR).div(basePoolSupply);
    const crvApyRAY = crvPerUnderlyingPerYearRAY.mul(getTokenPrice("CRV")).div(getTokenPrice(underlying));

    const cvxPerUnderlyingPerYearRAY = cvxPerSecond.mul(RAY).mul(SECONDS_PER_YEAR).div(basePoolSupply);
    const cvxApyRAY = cvxPerUnderlyingPerYearRAY.mul(getTokenPrice("CVX")).div(getTokenPrice(underlying));

    let totalExtraApyRAY = BigNumber.from(0);

    for (let i = 0; i < extraPoolAddresses.length; i++) {
        const extraReward = poolParams.extraRewards[i].rewardToken

        const extraPoolRate = poolData[3 + i];
        const extraPoolSupply = basePoolSupply;

        const extraPerUnderlyingPerYearRAY = extraPoolRate.mul(RAY).mul(SECONDS_PER_YEAR).div(extraPoolSupply);
        const extraApyRAY = extraPerUnderlyingPerYearRAY.mul(getTokenPrice(extraReward)).div(getTokenPrice(underlying));

        totalExtraApyRAY = totalExtraApyRAY.add(extraApyRAY);
    }

    const baseApyRAY = RAY.mul((await getCurveBaseApy(underlying)) / 100);

    return baseApyRAY.add(crvApyRAY).add(cvxApyRAY).add(totalExtraApyRAY);

}

async function getCVXMintAmount(
    amount: BigNumber,
    cvxSupply: BigNumber
) {

    const cliff = cvxSupply.div(CVX_REDUCTION_PER_CLIFF);

    if (cliff < CVX_TOTAL_CLIFFS) {
        const reduction = CVX_TOTAL_CLIFFS.sub(cliff);
        const mintedAmount = amount.mul(reduction).div(CVX_TOTAL_CLIFFS);
        return mintedAmount < CVX_MAX_SUPPLY.sub(cvxSupply) ? mintedAmount : CVX_MAX_SUPPLY.sub(cvxSupply);
    }

    return BigNumber.from(0);
}

async function getPoolData(
    basePoolAddress: string,
    cvxAddress: string,
    extraPoolAddresses: string[],
    provider: providers.Provider
) {

    let calls: Array<MCall<any>> = [
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
    ]

    for (let extraPoolAddress of extraPoolAddresses) {
        calls.push(
            {
                address: extraPoolAddress,
                interface: IBaseRewardPool__factory.createInterface(),
                method: "rewardRate()"
            }
        )
    }

    return await multicall(calls, provider);

}

export async function getCurveBaseApy(curveLPToken: CurveLPToken): Promise<number> {

  const poolName = curveLPTokenToPoolName[curveLPToken];

  try {
    const url = "https://www.convexfinance.com/api/curve-apys";
    const result = await axios.get<APYResponse>(url);

    const { baseApy = 0 } = result.data.apys[poolName.toLowerCase()] || {};

    return baseApy;
  } catch (e) {
    return 0;
  }
}

export function getRewards(pool: ConvexPoolContract): Array<SupportedToken> {
    return [
        "CRV",
        "CVX",
        ...(contractParams[pool] as ConvexPoolParams).extraRewards.map((d) => {d.rewardToken})
    ] as Array<SupportedToken>;
}
