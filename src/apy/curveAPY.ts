import axios from "axios";

import { WAD_DECIMALS_POW } from "../core/constants";
import { CurveLPToken } from "../tokens/curveLP";
import { GearboxToken } from "../tokens/gear";
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

interface CurvePoolData {
  address: string;
  amplificationCoefficient: string;
  assetType?: string;
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

type CurveAPYTokens = CurveLPToken | GearboxToken;

const APY_DICTIONARY: Record<CurveAPYTokens, string> = {
  "3Crv": "0", // 0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7
  FRAX3CRV: "34", // 0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B
  gusd3CRV: "19", // 0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956
  LUSD3CRV: "33", // 0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA
  crvPlain3andSUSD: "15", // 0xA5407eAE9Ba41422680e2e00537571bcC53efBfD
  steCRV: "14", // 0xDC24316b9AE028F1497c275EB9192a3Ea0f67022
  crvFRAX: "44", // 0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2
  GEAR: "factory-crypto-192", // 0x0E9B5B092caD6F1c5E6bc7f89Ffe1abb5c95F1C2
  OHMFRAXBP: "factory-crypto-158", // 0xfc1e8bf3e81383ef07be24c3fd146745719de48d
  MIM_3LP3CRV: "40", // 0x5a6a4d54456819380173272a5e8e9b9904bdf41b
  crvCRVETH: "crypto-3", // 0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511
  crvCVXETH: "crypto-4", // 0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4
  crvUSDTWBTCWETH: "factory-tricrypto-1",
  LDOETH: "factory-crypto-204",
};

const CRV_APY_RESPONSE_DECIMALS = 100;

// const CRYPTO = "https://api.curve.fi/api/getPools/ethereum/crypto";
// const FACTORY = "https://api.curve.fi/api/getPools/ethereum/factory";
const CURVE_APY_URL = "https://www.convexfinance.com/api/curve-apys";
const CURVE_MAIN_URL = "https://api.curve.fi/api/getPools/ethereum/main";
const CURVE_FACTORY_CRYPTO_URL =
  "https://api.curve.fi/api/getPools/ethereum/factory-crypto";
const CURVE_CRYPTO_URL = "https://api.curve.fi/api/getPools/ethereum/crypto";
const CURVE_FACTORY_TRICRYPTO_URL =
  "https://api.curve.fi/api/getPools/ethereum/factory-tricrypto";

interface CurveAPY {
  base: bigint;
  crv: bigint;
  gauge: Array<[string, bigint]>;
}
export type CurveAPYResult = Record<CurveAPYTokens, CurveAPY>;

export async function getCurveAPY(): Promise<CurveAPYResult | null> {
  try {
    const [
      { data: apyData },
      { data: main },
      { data: factoryCrypto },
      { data: crypto },
      { data: factoryTricrypto },
    ] = await Promise.all([
      axios.get<CurveAPYDataResponse>(CURVE_APY_URL),
      axios.get<CurvePoolDataResponse>(CURVE_MAIN_URL),
      axios.get<CurvePoolDataResponse>(CURVE_FACTORY_CRYPTO_URL),
      axios.get<CurvePoolDataResponse>(CURVE_CRYPTO_URL),
      axios.get<CurvePoolDataResponse>(CURVE_FACTORY_TRICRYPTO_URL),
    ]);

    const { apys } = apyData || {};
    const { poolData: mainPoolData = [] } = main?.data || {};
    const { poolData: factoryCryptoPoolData = [] } = factoryCrypto?.data || {};
    const { poolData: cryptoPoolData = [] } = crypto?.data || {};
    const { poolData: factoryTricryptoPoolData = [] } =
      factoryTricrypto?.data || {};

    const poolDataByID = Object.fromEntries([
      ...mainPoolData.map(p => [p.id, p] as const),
      ...factoryCryptoPoolData.map(p => [p.id, p] as const),
      ...cryptoPoolData.map(p => [p.id, p] as const),
      ...factoryTricryptoPoolData.map(p => [p.id, p] as const),
    ]);

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
          ({ apy = 0, symbol }): [string, bigint] => [
            symbol.toLowerCase(),
            curveAPYToBn(apy),
          ],
        );

        const maxCrv =
          pool?.gaugeCrvApy.length > 0 ? Math.max(...pool.gaugeCrvApy) : crvApy;

        acc[curveSymbol] = {
          base: curveAPYToBn(baseApy || 0),
          crv: curveAPYToBn(maxCrv || 0),
          gauge: extraRewards,
        };

        return acc;
      },
      {} as CurveAPYResult,
    );

    return curveAPY;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function curveAPYToBn(baseApy: number) {
  return toBN(
    (baseApy / CRV_APY_RESPONSE_DECIMALS).toString(),
    WAD_DECIMALS_POW,
  );
}
