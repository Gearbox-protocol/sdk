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

const NAME_DICTIONARY: Record<CurveLPToken, string> = {
  "3Crv": "3pool",
  FRAX3CRV: "frax",
  gusd3CRV: "gusd",
  LUSD3CRV: "lusd",
  crvPlain3andSUSD: "susdv2",
  steCRV: "steth",
  crvFRAX: "fraxusdc", // TODO: CHECK!
};

const RESPONSE_DECIMALS = 100;
const ZERO = BigNumber.from(0);

// https://www.convexfinance.com/api/curve-apys
// http://localhost:8000/api/curve-apys
const URL = "https://www.convexfinance.com/api/curve-apys";

export type CurveAPYResult = Record<CurveLPToken, BigNumber>;

export async function getCurveAPY(): Promise<CurveAPYResult> {
  try {
    const { data } = await axios.get<Response>(URL);
    const { apys } = data || {};

    const curveAPY = objectEntries(NAME_DICTIONARY).reduce<CurveAPYResult>(
      (acc, [curveSymbol, apiEntry]) => {
        const { baseApy = 0 } = apys[apiEntry] || {};
        acc[curveSymbol] = toBN(
          (baseApy / RESPONSE_DECIMALS).toString(),
          WAD_DECIMALS_POW,
        );
        return acc;
      },
      {} as CurveAPYResult,
    );

    return curveAPY;
  } catch (e) {
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
