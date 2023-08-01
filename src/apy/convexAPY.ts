import { BigNumber } from "ethers";

import {
  contractParams,
  contractsByNetwork,
  ConvexPoolContract,
  ConvexPoolParams,
  CurveGEARPoolParams,
  CurveParams,
  CurveSteCRVPoolParams,
} from "../contracts/contracts";
import { NetworkType } from "../core/chains";
import { PRICE_DECIMALS, SECONDS_PER_YEAR, WAD } from "../core/constants";
import {
  ConvexPhantomTokenData,
  ConvexStakedPhantomToken,
} from "../tokens/convex";
import { CurveLPToken, CurveLPTokenData } from "../tokens/curveLP";
import { decimals } from "../tokens/decimals";
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
  IERC20,
  IERC20__factory,
} from "../types";
import { formatBN, toBigInt } from "../utils/formatter";
import { MCall } from "../utils/multicall";
import { PriceUtils } from "../utils/price";
import { CurveAPYResult } from "./curveAPY";

const V2_POOLS: Record<number, true> = { 20: true };

type GetTokenPriceCallback = (
  tokenAddress: string,
  currency?: string,
) => bigint;

export interface GetConvexAPYBulkProps {
  getTokenPrice: GetTokenPriceCallback;
  curveAPY: CurveAPYResult;
  generated: GetConvexAPYBulkCallsReturns;
  response: Array<BigNumber>;
}

export function getConvexAPYBulk(props: GetConvexAPYBulkProps) {
  const { poolsInfo, calls } = props.generated;

  const [parsedResponse] = calls.reduce<[Array<Array<BigNumber>>, number]>(
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
        crvLpSupply,
        cvxPoolRewardsFinish,
        cvxPoolRate,
        cvxPoolSupply,
        crvVPrice,
        cvxTokenSupply,
        ...rest
      ],
      i,
    ) => {
      const { cvxExtraPools, crvV2Tokens } = poolsInfo[i];

      const extraEnd = cvxExtraPools.length;
      const cvxExtraRewards = rest.slice(0, extraEnd);

      const extraFinishEnd = cvxExtraPools.length * 2;
      const cvxExtraRewardsFinish = rest.slice(extraEnd, extraFinishEnd);

      const v2Tokens = extraFinishEnd + crvV2Tokens.length;
      const crvTokenBalances = rest.slice(extraFinishEnd, v2Tokens);

      const apy = calculateConvexAPY({
        crvLpSupply: toBigInt(crvLpSupply),
        cvxPoolRewardsFinish: toBigInt(cvxPoolRewardsFinish),
        cvxPoolRate: toBigInt(cvxPoolRate),
        cvxPoolSupply: toBigInt(cvxPoolSupply),
        crvVPrice: toBigInt(crvVPrice),
        cvxTokenSupply: toBigInt(cvxTokenSupply),
        cvxExtraRewards: cvxExtraRewards.map(v => toBigInt(v)),
        cvxExtraRewardsFinish: cvxExtraRewardsFinish.map(v => toBigInt(v)),
        crvTokenBalances: crvTokenBalances.map(v => toBigInt(v)),

        info: poolsInfo[i],
        getTokenPrice: props.getTokenPrice,
        curveAPY: props.curveAPY,
      });

      return apy;
    },
  );

  return apyList;
}

interface GetPoolInfoProps {
  pool: ConvexPoolContract;
  networkType: NetworkType;
}

interface PoolInfo {
  cvxPool: ConvexPoolParams;
  cvxPoolAddress: string;
  cvxExtraPools: string[];

  crvPoolAddress: string;
  crvToken: CurveLPToken;
  crvPool: CrvParams;
  crvV2Tokens: CrvParams["tokens"];

  tokenList: Record<SupportedToken, string>;
}

type CrvParams = CurveParams | CurveSteCRVPoolParams | CurveGEARPoolParams;

function getPoolInfo({ pool, networkType }: GetPoolInfoProps): PoolInfo {
  const tokenList = tokenDataByNetwork[networkType];
  const contractsList = contractsByNetwork[networkType];

  const poolParams = contractParams[pool] as ConvexPoolParams;
  const basePoolAddress = contractsList[pool];

  const extraPoolAddresses = poolParams.extraRewards.map(
    d => d.poolAddress[networkType],
  );

  const stakedTokenParams = supportedTokens[
    poolParams.stakedToken
  ] as ConvexPhantomTokenData;
  const { underlying } = stakedTokenParams;

  const crvParams = supportedTokens[underlying] as CurveLPTokenData;
  const swapPoolAddress = contractsList[crvParams.pool];
  const crvPoolParams = contractParams[crvParams.pool] as CrvParams;

  const crvV2Tokens = V2_POOLS[crvPoolParams.version]
    ? crvPoolParams.tokens
    : [];

  return {
    cvxPool: poolParams,
    cvxPoolAddress: basePoolAddress,
    cvxExtraPools: extraPoolAddresses,

    crvPoolAddress: swapPoolAddress,
    crvPool: crvPoolParams,
    crvV2Tokens,
    crvToken: underlying,

    tokenList,
  };
}

type GetConvexAPYBulkCallsReturns = ReturnType<typeof getConvexAPYBulkCalls>;

export interface GetConvexAPYBulkCallsProps {
  pools: Array<ConvexPoolContract>;
  networkType: NetworkType;
}

export function getConvexAPYBulkCalls({
  pools,
  networkType,
}: GetConvexAPYBulkCallsProps) {
  const poolsInfo = pools.map(pool => getPoolInfo({ networkType, pool }));
  const calls = poolsInfo.map(info => getPoolDataCalls(info));

  return { poolsInfo, calls };
}

type IBaseRewardPoolInterface = IBaseRewardPool["interface"];
type IConvexTokenInterface = IConvexToken["interface"];
type CurveV1AdapterStETHInterface = ICurvePool["interface"];
type IERC20Interface = IERC20["interface"];

function getPoolDataCalls(props: PoolInfo) {
  const calls: [
    MCall<IERC20Interface>,
    MCall<IBaseRewardPoolInterface>,
    MCall<IBaseRewardPoolInterface>,
    MCall<IBaseRewardPoolInterface>,
    MCall<CurveV1AdapterStETHInterface>,
    MCall<IConvexTokenInterface>,
    ...Array<MCall<IBaseRewardPoolInterface>>,
    ...Array<MCall<IERC20Interface>>,
  ] = [
    {
      address: props.tokenList[props.crvPool.lpToken],
      interface: IERC20__factory.createInterface(),
      method: "totalSupply()",
    },
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
    ...props.crvV2Tokens.map(
      (t): MCall<IERC20Interface> => ({
        address: props.tokenList[t],
        interface: IERC20__factory.createInterface(),
        method: "balanceOf(address)",
        params: [props.crvPoolAddress],
      }),
    ),
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
  crvLpSupply: bigint;
  crvTokenBalances: Array<bigint>;

  info: PoolInfo;
  getTokenPrice: GetTokenPriceCallback;
  curveAPY: CurveAPYResult;
}

const CURRENCY_LIST: Partial<Record<ConvexStakedPhantomToken, SupportedToken>> =
  {
    stkcvxsteCRV: "WETH",
  };

function calculateConvexAPY(props: CalculateConvexAPYProps) {
  const { tokenList, cvxPool, crvToken, cvxExtraPools } = props.info;
  const currentTimestamp = getTimestampInSeconds();

  const currencySymbol = CURRENCY_LIST[cvxPool.stakedToken];
  const currency = currencySymbol && tokenList[currencySymbol || ""];

  const cvxPrice = props.getTokenPrice(tokenList.CVX, currency);
  const crvPrice = props.getTokenPrice(tokenList.CRV, currency);

  const crvPerSecond = props.cvxPoolRate;
  const vPrice = getVirtualPrice(props);
  const virtualSupply = (props.cvxPoolSupply * vPrice) / WAD;
  const crvPerUnderlying = (crvPerSecond * WAD) / virtualSupply;

  const crvPerYear = crvPerUnderlying * BigInt(SECONDS_PER_YEAR);
  const cvxPerYear = getCVXMintAmount(crvPerYear, props.cvxTokenSupply);

  const baseFinished = props.cvxPoolRewardsFinish <= currentTimestamp;

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

    const finished = extraFinished <= currentTimestamp;

    return finished ? 0n : extraAPY;
  });

  const extraAPYTotal = extraAPRs.reduce((acc, apy) => acc + apy, 0n);

  const baseApyWAD = props.curveAPY[crvToken].base;

  return baseApyWAD + crvAPY + cvxAPY + extraAPYTotal;
}

function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
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
    const total = props.crvTokenBalances.reduce((sum, a, i) => {
      const symbol = props.info.crvV2Tokens[i];
      const price = props.getTokenPrice(props.info.tokenList[symbol]);

      const tokenMoney = PriceUtils.calcTotalPrice(price, a, decimals[symbol]);

      return sum + tokenMoney;
    }, 0n);

    return (
      (total * WAD) /
      ((props.crvLpSupply * WAD) /
        10n ** BigInt(decimals[props.info.crvPool.lpToken]))
    );
  } else {
    return props.crvVPrice;
  }
}
