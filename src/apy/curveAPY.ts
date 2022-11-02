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

const POOL_DICTIONARY: Record<CurveLPToken, string> = {
  "3Crv": "0", // 0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7
  FRAX3CRV: "34", // 0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B
  gusd3CRV: "19", // 0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956
  LUSD3CRV: "33", // 0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA
  crvPlain3andSUSD: "15", // 0xA5407eAE9Ba41422680e2e00537571bcC53efBfD
  steCRV: "14", // 0xDC24316b9AE028F1497c275EB9192a3Ea0f67022
  crvFRAX: "44", // 0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2
};

const RESPONSE_DECIMALS = 100;
const ZERO = BigNumber.from(0);

// const MAIN = "https://api.curve.fi/api/getPools/ethereum/main";
// const CRYPTO = "https://api.curve.fi/api/getPools/ethereum/crypto";
// const FACTORY = "https://api.curve.fi/api/getPools/ethereum/factory";
// const FACTORY_CRYPTO = "https://api.curve.fi/api/getPools/ethereum/factory-crypto";

// https://www.convexfinance.com/api/curve-apys
// http://localhost:8000/api/curve-apys
const URL = "https://www.convexfinance.com/api/curve-apys";

export type CurveAPYResult = Record<CurveLPToken, BigNumber>;

export async function getCurveAPY(): Promise<CurveAPYResult> {
  try {
    const { data } = await axios.get<Response>(URL);
    const { apys } = data || {};

    const curveAPY = objectEntries(POOL_DICTIONARY).reduce<CurveAPYResult>(
      (acc, [curveSymbol, poolId]) => {
        const { baseApy } = apys[poolId] || {};
        if (baseApy === undefined)
          console.warn(`No base apy for: ${curveSymbol}, ${poolId}`);

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
