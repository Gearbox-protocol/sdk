import { BigNumber, providers } from "ethers";

import {
  contractParams,
  contractsByNetwork,
  CurveGEARPoolParams,
} from "../contracts/contracts";
import { NetworkType } from "../core/chains";
import { MS_PER_YEAR, WAD } from "../core/constants";
import { ICurvePool, ICurvePool__factory } from "../types";
import { MCall, multicall } from "../utils/multicall";

interface GetGEARCurveAPYBaseProps {
  pool: "CURVE_GEAR_POOL";
  networkType: NetworkType;
}

export interface GetGEARCurveAPYProps extends GetGEARCurveAPYBaseProps {
  provider: providers.Provider;
}

export async function getGEARCurveAPY(props: GetGEARCurveAPYProps) {
  const poolInfo = getPoolInfo(props);
  const calls = getPoolDataCalls(poolInfo);

  const response = await multicall<Array<BigNumber>>(calls, props.provider);

  return calculateGearCurveAPY(response);
}

type GetPoolInfoReturns = ReturnType<typeof getPoolInfo>;

function getPoolInfo({ pool, networkType }: GetGEARCurveAPYBaseProps) {
  const contractsList = contractsByNetwork[networkType];

  const poolParams = contractParams[pool] as CurveGEARPoolParams;
  const poolAddress = contractsList[pool];

  return { poolParams, poolAddress };
}

type CurveV1AdapterStETHInterface = ICurvePool["interface"];

function getPoolDataCalls({ poolAddress, poolParams }: GetPoolInfoReturns) {
  const calls: [
    MCall<CurveV1AdapterStETHInterface>,
    MCall<CurveV1AdapterStETHInterface>,
  ] = [
    {
      address: poolAddress,
      interface: ICurvePool__factory.createInterface(),
      method: "get_virtual_price()",
    },
    {
      address: poolAddress,
      interface: ICurvePool__factory.createInterface(),
      method: "balances(uint256)",
      params: [poolParams.tokens.findIndex(t => t === "GEAR")],
    },
  ];

  return calls;
}

const POOL_START = 1671264000 * 1000;

const lmRewardsPerMonth = BigNumber.from(1);
const ciderFees = BigNumber.from(1);
const rewardsAmountPerMonth = BigNumber.from(lmRewardsPerMonth).add(
  BigNumber.from(ciderFees).div(4),
);

function calculateGearCurveAPY(response: Array<BigNumber>) {
  const [vPrice, gearBalance] = response;

  const tradingAPY = vPrice
    .sub(WAD)
    .mul(MS_PER_YEAR)
    .div(Date.now() - POOL_START);

  const cideredAPYPlusLM = rewardsAmountPerMonth
    .mul(12)
    .div(gearBalance.mul(2));

  return { tradingAPY, cideredAPYPlusLM };
}
