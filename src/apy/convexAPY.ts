import {
  contractParams,
  contractsByNetwork,
  ConvexPoolContract,
  ConvexPoolParams,
  CurveGEARPoolParams,
  CurveParams,
  CurveSteCRVPoolParams,
  MCall,
  NetworkType,
  PartialRecord,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  SECONDS_PER_YEAR,
  toBigInt,
  WAD,
} from "@gearbox-protocol/sdk-gov";
import {
  ConvexPhantomTokenData,
  ConvexStakedPhantomToken,
} from "@gearbox-protocol/sdk-gov/lib/tokens/convex";
import {
  CurveLPToken,
  CurveLPTokenData,
} from "@gearbox-protocol/sdk-gov/lib/tokens/curveLP";
import {
  SupportedToken,
  supportedTokens,
  tokenDataByNetwork,
} from "@gearbox-protocol/sdk-gov/lib/tokens/token";
import { BigNumberish, Interface } from "ethers";

import {
  IBaseRewardPool,
  IBaseRewardPool__factory,
  IConvexToken,
  IConvexToken__factory,
  ICurvePool,
  ICurvePool__factory,
} from "../types";
import { CurveAPYResult } from "./curveAPY";

const V2_POOLS: Record<number, true> = { 20: true };

type GetTokenPriceCallback = (
  tokenAddress: string,
  currency?: string,
) => bigint;

export interface GetConvexAPYBulkProps {
  getTokenPrice: GetTokenPriceCallback;
  curveAPY: CurveAPYResult | undefined;
  generated: GetConvexAPYBulkCallsReturns;
  response: Array<BigNumberish>;
  network: NetworkType;
  currentTimestamp: number;
}

export function getConvexAPYBulk(props: GetConvexAPYBulkProps) {
  if (props.network !== "Mainnet") {
    return [];
  }

  const { poolsInfo, calls } = props.generated;

  const [parsedResponse] = calls.reduce<
    [Array<Array<BigNumberish | undefined>>, number]
  >(
    ([acc, start], call) => {
      const end = start + call.length;

      const currentResponse = props.response.slice(start, end);
      acc.push(currentResponse);

      return [acc, end];
    },
    [[], 0],
  );

  const apyList = parsedResponse.map(
    (
      [
        cvxPoolRewardsFinish = 0n,
        cvxPoolRate = 0n,
        cvxPoolSupply = 0n,
        crvVPrice = 0n,
        cvxTokenSupply = 0n,
        ...rest
      ],
      i,
    ) => {
      const { cvxExtraPools, crvLpPrice: crvLpPriceList } = poolsInfo[i];

      const extraEnd = cvxExtraPools.length;
      const cvxExtraRewards = rest.slice(0, extraEnd);

      const extraFinishEnd = cvxExtraPools.length * 2;
      const cvxExtraRewardsFinish = rest.slice(extraEnd, extraFinishEnd);

      const lpPriceEnd = extraFinishEnd + crvLpPriceList.length;
      const crvLpPrice = rest.slice(extraFinishEnd, lpPriceEnd);

      const apy = calculateConvexAPY({
        cvxPoolRewardsFinish: toBigInt(cvxPoolRewardsFinish),
        cvxPoolRate: toBigInt(cvxPoolRate),
        cvxPoolSupply: toBigInt(cvxPoolSupply),
        crvVPrice: toBigInt(crvVPrice),
        cvxTokenSupply: toBigInt(cvxTokenSupply),
        cvxExtraRewards: cvxExtraRewards.map(v => toBigInt(v || 0n)),
        cvxExtraRewardsFinish: cvxExtraRewardsFinish.map(v =>
          toBigInt(v || 0n),
        ),
        crvLpPrice: crvLpPrice.map(v => toBigInt(v || 0n)),

        info: poolsInfo[i],
        getTokenPrice: props.getTokenPrice,
        curveAPY: props.curveAPY,

        currentTimestamp: props.currentTimestamp,
      });

      return apy;
    },
  );

  return apyList;
}

interface GetPoolInfoProps {
  pool: ConvexPoolContract;
  network: NetworkType;
}

interface PoolInfo {
  cvxPool: ConvexPoolParams;
  cvxPoolAddress: string;
  cvxExtraPools: string[];

  crvPoolAddress: string;
  crvToken: CurveLPToken;
  crvPool: CrvParams;
  crvLpPrice: Array<string>;

  tokenList: Record<SupportedToken, string>;
}

type CrvParams = CurveParams | CurveSteCRVPoolParams | CurveGEARPoolParams;

function getPoolInfo({ pool, network }: GetPoolInfoProps): PoolInfo {
  const tokenList = tokenDataByNetwork[network];
  const contractsList = contractsByNetwork[network];

  const poolParams = contractParams[pool] as ConvexPoolParams;
  const basePoolAddress = contractsList[pool];

  const extraPoolAddresses = poolParams.extraRewards.map(
    d => d.poolAddress[network],
  );

  const stakedTokenParams = supportedTokens[
    poolParams.stakedToken
  ] as ConvexPhantomTokenData;
  const { underlying } = stakedTokenParams;

  const crvParams = supportedTokens[underlying] as CurveLPTokenData;
  const swapPoolAddress = contractsList[crvParams.pool];
  const crvPoolParams = contractParams[crvParams.pool] as CrvParams;

  const crvLpPrice = V2_POOLS[crvPoolParams["version"]]
    ? [swapPoolAddress]
    : [];

  return {
    cvxPool: poolParams,
    cvxPoolAddress: basePoolAddress,
    cvxExtraPools: extraPoolAddresses,

    crvPoolAddress: swapPoolAddress,
    crvPool: crvPoolParams,
    crvToken: underlying,
    crvLpPrice,

    tokenList,
  };
}

type GetConvexAPYBulkCallsReturns = ReturnType<typeof getConvexAPYBulkCalls>;

export interface GetConvexAPYBulkCallsProps {
  pools: Array<ConvexPoolContract>;
  network: NetworkType;
}

export function getConvexAPYBulkCalls({
  pools,
  network,
}: GetConvexAPYBulkCallsProps) {
  if (network !== "Mainnet") {
    return { poolsInfo: [], calls: [] };
  }

  const poolsInfo = pools.map(pool => getPoolInfo({ network, pool }));
  const calls = poolsInfo.map(info => getPoolDataCalls(info));

  return { poolsInfo, calls };
}

type IBaseRewardPoolInterface = IBaseRewardPool["interface"];
type IConvexTokenInterface = IConvexToken["interface"];
type CurveV1AdapterStETHInterface = ICurvePool["interface"];

function getPoolDataCalls(props: PoolInfo) {
  const calls: [
    MCall<IBaseRewardPoolInterface>,
    MCall<IBaseRewardPoolInterface>,
    MCall<IBaseRewardPoolInterface>,
    MCall<CurveV1AdapterStETHInterface>,
    MCall<IConvexTokenInterface>,
    ...Array<MCall<IBaseRewardPoolInterface>>,
    ...Array<MCall<any>>,
  ] = [
    {
      address: props.cvxPoolAddress,
      interface: IBaseRewardPool__factory.createInterface(),
      method: "periodFinish()",
    },
    {
      address: props.cvxPoolAddress,
      interface: IBaseRewardPool__factory.createInterface(),
      method: "rewardRate()",
    },
    {
      address: props.cvxPoolAddress,
      interface: IBaseRewardPool__factory.createInterface(),
      method: "totalSupply()",
    },
    {
      address: props.crvPoolAddress,
      interface: ICurvePool__factory.createInterface(),
      method: "get_virtual_price()",
    },
    {
      address: props.tokenList.CVX,
      interface: IConvexToken__factory.createInterface(),
      method: "totalSupply()",
    },
    ...props.cvxExtraPools.map(
      (extraPoolAddress): MCall<IBaseRewardPoolInterface> => ({
        address: extraPoolAddress,
        interface: IBaseRewardPool__factory.createInterface(),
        method: "rewardRate()",
      }),
    ),
    ...props.cvxExtraPools.map(
      (extraPoolAddress): MCall<IBaseRewardPoolInterface> => ({
        address: extraPoolAddress,
        interface: IBaseRewardPool__factory.createInterface(),
        method: "periodFinish()",
      }),
    ),
    ...(V2_POOLS[props.crvPool["version"]]
      ? [
          {
            address: props.crvPoolAddress,
            interface: new Interface([
              "function lp_price() view returns (uint256)",
            ]),
            method: "lp_price()",
          },
        ]
      : []),
  ];

  return calls;
}

const CVX_MAX_SUPPLY = WAD * 100000000n;
const CVX_REDUCTION_PER_CLIFF = 100000n;
const CVX_TOTAL_CLIFFS = WAD * 1000n;

export interface CalculateConvexAPYProps {
  cvxPoolRate: bigint;
  cvxPoolSupply: bigint;
  cvxTokenSupply: bigint;
  cvxPoolRewardsFinish: bigint;

  cvxExtraRewards: Array<bigint>;
  cvxExtraRewardsFinish: Array<bigint>;

  crvVPrice: bigint;
  crvLpPrice: Array<bigint>;

  info: PoolInfo;
  getTokenPrice: GetTokenPriceCallback;
  curveAPY: CurveAPYResult | undefined;

  currentTimestamp: number;
}

const CURRENCY_LIST: PartialRecord<ConvexStakedPhantomToken, SupportedToken> = {
  stkcvxsteCRV: "WETH",
  stkcvxcrvCVXETH: "WETH",
  stkcvxcrvCRVETH: "WETH",
  stkcvxLDOETH: "WETH",
  stkcvxcrvUSDTWBTCWETH: "USDT",
};

function calculateConvexAPY(props: CalculateConvexAPYProps) {
  const { tokenList, cvxPool, crvToken, cvxExtraPools } = props.info;

  const currencySymbol = CURRENCY_LIST[cvxPool.stakedToken];
  const currency = currencySymbol && tokenList[currencySymbol || ""];

  const cvxPrice = props.getTokenPrice(tokenList.CVX, currency);
  const crvPrice = props.getTokenPrice(tokenList.CRV, currency);

  const crvPerSecond = props.cvxPoolRate;
  const vPrice = getVirtualPrice(props);
  const virtualSupply = (props.cvxPoolSupply * vPrice) / WAD;
  if (!virtualSupply) return 0;

  const crvPerUnderlying = (crvPerSecond * WAD) / virtualSupply;

  const crvPerYear = crvPerUnderlying * BigInt(SECONDS_PER_YEAR);
  const cvxPerYear = getCVXMintAmount(crvPerYear, props.cvxTokenSupply);

  const baseFinished = props.cvxPoolRewardsFinish <= props.currentTimestamp;

  const crvAPY = baseFinished ? 0n : (crvPerYear * crvPrice) / PRICE_DECIMALS;
  const cvxAPY = baseFinished ? 0n : (cvxPerYear * cvxPrice) / PRICE_DECIMALS;

  const extraAPRs = cvxExtraPools.map((_, index) => {
    const extraRewardSymbol = cvxPool.extraRewards[index].rewardToken;
    const extraPoolRate = props.cvxExtraRewards[index];
    const extraFinished = props.cvxExtraRewardsFinish[index];

    const perUnderlying = (extraPoolRate * WAD) / virtualSupply;
    const perYear = perUnderlying * BigInt(SECONDS_PER_YEAR);

    const extraPrice = props.getTokenPrice(
      tokenList[extraRewardSymbol],
      currency,
    );

    const extraAPY = (perYear * extraPrice) / PRICE_DECIMALS;

    const finished = extraFinished <= props.currentTimestamp;

    return finished ? 0n : extraAPY;
  });

  const extraAPYTotal = extraAPRs.reduce((acc, apy) => acc + apy, 0n);

  const baseApy = props.curveAPY?.[crvToken]?.base || 0;

  const apyTotal = crvAPY + cvxAPY + extraAPYTotal;
  const apyTotalInPercent = apyTotal * PERCENTAGE_DECIMALS * PERCENTAGE_FACTOR;
  const r = baseApy + Math.round(Number((apyTotalInPercent * 10n) / WAD) / 10);

  return r;
}

export function getCVXMintAmount(crvAmount: bigint, cvxTokenSupply: bigint) {
  const currentCliff = cvxTokenSupply / CVX_REDUCTION_PER_CLIFF;

  if (currentCliff < CVX_TOTAL_CLIFFS) {
    const remainingCliffs = CVX_TOTAL_CLIFFS - currentCliff;

    const mintedAmount = (crvAmount * remainingCliffs) / CVX_TOTAL_CLIFFS;
    const amountTillMax = CVX_MAX_SUPPLY - cvxTokenSupply;

    return mintedAmount > amountTillMax ? amountTillMax : mintedAmount;
  }

  return 0n;
}

function getVirtualPrice(props: CalculateConvexAPYProps) {
  if (V2_POOLS[props.info.crvPool.version]) {
    return props.crvLpPrice[0] ?? props.crvVPrice;
  } else {
    return props.crvVPrice;
  }
}
