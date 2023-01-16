import axios from "axios";
import { BigNumber } from "ethers";

import { WAD_DECIMALS_POW } from "../core/constants";
import { CurveLPToken } from "../tokens/curveLP";
import { toBN } from "../utils/formatter";
import { objectEntries } from "../utils/mappers";

interface CurveAPYData {
  baseApy: number;
  crvApy: number;
  crvBoost: number;
  crvPrice: number;
}

interface CurveAPYDataResponse {
  apys: Record<string, CurveAPYData>;
}

type CurveAPYTokens = CurveLPToken;

const APY_DICTIONARY: Record<CurveAPYTokens, string> = {
  "3Crv": "0", // 0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7
  FRAX3CRV: "34", // 0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B
  gusd3CRV: "19", // 0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956
  LUSD3CRV: "33", // 0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA
  crvPlain3andSUSD: "15", // 0xA5407eAE9Ba41422680e2e00537571bcC53efBfD
  steCRV: "14", // 0xDC24316b9AE028F1497c275EB9192a3Ea0f67022
  crvFRAX: "44", // 0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2
};

const CRV_APY_RESPONSE_DECIMALS = 100;
const ZERO: CurveAPY = {
  base: BigNumber.from(0),
  crv: BigNumber.from(0),
  gauge: [],
};

// const MAIN = "https://api.curve.fi/api/getPools/ethereum/main";
// const CRYPTO = "https://api.curve.fi/api/getPools/ethereum/crypto";
// const FACTORY = "https://api.curve.fi/api/getPools/ethereum/factory";
const CURVE_FACTORY_CRYPTO_URL =
  "https://api.curve.fi/api/getPools/ethereum/factory-crypto";
const CURVE_APY_URL = "https://www.convexfinance.com/api/curve-apys";

interface CurveAPY {
  base: BigNumber;
  crv: BigNumber;
  gauge: Array<[string, BigNumber]>;
}
export type CurveAPYResult = Record<CurveAPYTokens, CurveAPY>;

export async function getCurveAPY(): Promise<[CurveAPYResult, CurveAPY]> {
  try {
    const [{ data: apyData }, { data: poolDataResp }] = await Promise.all([
      axios.get<CurveAPYDataResponse>(CURVE_APY_URL),
      axios.get<CurvePoolDataResponse>(CURVE_FACTORY_CRYPTO_URL),
    ]);

    const { apys } = apyData || {};
    const { poolData = [] } = poolDataResp?.data || {};
    const poolDataByID = Object.fromEntries(
      poolData.map(p => [p.id, p] as const),
    );

    const curveAPY = objectEntries(APY_DICTIONARY).reduce<CurveAPYResult>(
      (acc, [curveSymbol, poolId]) => {
        const { baseApy, crvApy } = apys[poolId] || {};
        if (baseApy === undefined)
          console.warn(`No base apy for: ${curveSymbol}, ${poolId}`);

        const pool = poolDataByID[poolId];
        const { gaugeRewards = [] } = pool || {};
        if (pool === undefined)
          console.warn(`No pool data for: ${curveSymbol}, ${poolId}`);
        const extraRewards = gaugeRewards.map(
          ({ apy = 0, symbol }): [string, BigNumber] => [
            symbol.toLowerCase(),
            curveAPYToBn(apy),
          ],
        );

        acc[curveSymbol] = {
          base: curveAPYToBn(baseApy || 0),
          crv: curveAPYToBn(crvApy || 0),
          gauge: extraRewards,
        };

        return acc;
      },
      {} as CurveAPYResult,
    );

    const gearAPY = await getGEARCurveAPY(apys, poolDataResp);

    return [curveAPY, gearAPY];
  } catch (e) {
    console.error(e);
    return [
      {
        "3Crv": ZERO,
        crvFRAX: ZERO,
        FRAX3CRV: ZERO,
        gusd3CRV: ZERO,
        LUSD3CRV: ZERO,
        crvPlain3andSUSD: ZERO,
        steCRV: ZERO,
      },
      ZERO,
    ];
  }
}

function curveAPYToBn(baseApy: number) {
  return toBN(
    (baseApy / CRV_APY_RESPONSE_DECIMALS).toString(),
    WAD_DECIMALS_POW,
  );
}

interface CurvePoolData {
  address: string;
  amplificationCoefficient: string;
  assetTypeName: string;
  coins: Array<{
    address: string;
    decimals: string;
    isBasePoolLpToken: boolean;
    poolBalance: string;
    symbol: string;
    usdPrice: number;
  }>;
  coinsAddresses: Array<string>;
  decimals: Array<string>;
  gaugeAddress: string;
  gaugeCrvApy: Array<number>;
  gaugeRewards: Array<{
    apy: number;
    decimals: string;
    gaugeAddress: string;
    name: string;
    symbol: string;
    tokenAddress: string;
    tokenPrice: number;
  }>;
  id: string;
  implementation: string;
  implementationAddress: string;
  isMetaPool: boolean;
  lpTokenAddress: string;
  name: string;
  poolUrls: {
    deposit: Array<string>;
    swap: Array<string>;
    withdraw: Array<string>;
  };
  priceOracle: number;
  symbol: string;
  totalSupply: string;
  usdTotal: number;
  usdTotalExcludingBasePool: number;
  virtualPrice: string;
}
interface CurvePoolDataResponse {
  data: {
    poolData: Array<CurvePoolData>;
    tvlAll: number;
    tvl: number;
  };
}

const POOL_DICTIONARY = {
  GEAR: "factory-crypto-192", // 0x0e9b5b092cad6f1c5e6bc7f89ffe1abb5c95f1c2
} as const;

async function getGEARCurveAPY(
  apys: Record<string, CurveAPYData>,
  poolDataResp: CurvePoolDataResponse,
): Promise<CurveAPY> {
  const { poolData = [] } = poolDataResp?.data || {};

  const gearPool = poolData.find(p => p.id === POOL_DICTIONARY.GEAR);
  if (gearPool === undefined) console.warn("No GEAR pool found");

  const { gaugeRewards = [] } = gearPool || {};

  const extraRewards = gaugeRewards.map(
    ({ apy = 0, symbol }): [string, BigNumber] => [
      symbol.toLowerCase(),
      curveAPYToBn(apy),
    ],
  );

  const { baseApy, crvApy } = apys[POOL_DICTIONARY.GEAR] || {};
  if (baseApy === undefined)
    console.warn(`No base apy for: GEAR, ${POOL_DICTIONARY.GEAR}`);

  const base = curveAPYToBn(baseApy || 0);
  const crv = curveAPYToBn(crvApy || 0);

  return { base, crv, gauge: extraRewards };
}
