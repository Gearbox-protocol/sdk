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

interface Response {
  apys: Record<string, CurveAPYData>;
}

interface CurvePoolData {
  id: string;
  symbol: string;
  address: string;
  name: string;
}

interface PoolResponse {
  data: { poolData: Array<CurvePoolData> };
}

const POOL_DICTIONARY: Record<CurveLPToken, string> = {
  "3Crv": "0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7", // "0",
  FRAX3CRV: "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B", // "factory-v2-13",
  gusd3CRV: "0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956", // "19",
  LUSD3CRV: "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA", // "factory-v2-16",
  crvPlain3andSUSD: "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD", // "15",
  steCRV: "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022", // "14",
  crvFRAX: "0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2", // "44",
};

const RESPONSE_DECIMALS = 100;
const ZERO = BigNumber.from(0);

// https://www.convexfinance.com/api/curve-apys
// http://localhost:8000/api/curve-apys
const URL = "https://www.convexfinance.com/api/curve-apys";

const MAIN = "https://api.curve.fi/api/getPools/ethereum/main";
const CRYPTO = "https://api.curve.fi/api/getPools/ethereum/crypto";
const FACTORY = "https://api.curve.fi/api/getPools/ethereum/factory";
const FACTORY_CRYPTO =
  "https://api.curve.fi/api/getPools/ethereum/factory-crypto";

export type CurveAPYResult = Record<CurveLPToken, BigNumber>;

export async function getCurveAPY(): Promise<CurveAPYResult> {
  try {
    const [{ data }, ...poolResponses] = await Promise.all([
      axios.get<Response>(URL),
      axios.get<PoolResponse>(MAIN),
      axios.get<PoolResponse>(CRYPTO),
      axios.get<PoolResponse>(FACTORY),
      axios.get<PoolResponse>(FACTORY_CRYPTO),
    ]);
    const { apys } = data || {};

    const pools = poolResponses.map(pr => pr.data.data.poolData).flat(1);

    const poolRecord = pools
      .filter(({ name }) => !!name)
      .reduce<Record<string, { id: string; symbol: string }>>((acc, p) => {
        acc[p.address.toLowerCase()] = p;
        return acc;
      }, {});

    const curveAPY = objectEntries(POOL_DICTIONARY).reduce<CurveAPYResult>(
      (acc, [curveSymbol, poolAddress]) => {
        const pool = poolRecord[poolAddress.toLowerCase()];
        if (!pool) {
          console.error(`Curve pool not found: ${curveSymbol}`);
          acc[curveSymbol] = BigNumber.from(0);
          return acc;
        }

        const { baseApy } = apys[pool.id] || {};
        if (baseApy === undefined)
          console.warn(
            `No base apy for: ${curveSymbol}, ${pool.id}, ${poolAddress}`,
          );

        acc[curveSymbol] = toBN(
          ((baseApy || 0) / RESPONSE_DECIMALS).toString(),
          WAD_DECIMALS_POW,
        );
        return acc;
      },
      {} as CurveAPYResult,
    );

    return curveAPY;
  } catch (e) {
    console.error(e);
    return {
      "3Crv": ZERO,
      crvFRAX: ZERO,
      FRAX3CRV: ZERO,
      gusd3CRV: ZERO,
      LUSD3CRV: ZERO,
      crvPlain3andSUSD: ZERO,
      steCRV: ZERO,
    };
  }
}
