import axios from "axios";
import { BigNumber } from "ethers";

import { WAD_DECIMALS_POW } from "../core/constants";
import { toBN } from "../utils/formatter";
import {
  CRV_APY_RESPONSE_DECIMALS,
  CURVE_APY_URL,
  CurveAPYDataResponse,
} from "./curveAPY";

const POOL_DICTIONARY = {
  GEAR: "factory-crypto-192", // 0x0e9b5b092cad6f1c5e6bc7f89ffe1abb5c95f1c2
} as const;

interface GEARCurveAPY {
  base: BigNumber;
  crv: BigNumber;
  gear: BigNumber;
}

export async function getGEARCurveAPY(): Promise<GEARCurveAPY> {
  const { data } = await axios.get<CurveAPYDataResponse>(CURVE_APY_URL);
  const { apys } = data || {};

  const { baseApy, crvApy } = apys[POOL_DICTIONARY.GEAR] || {};
  if (baseApy === undefined)
    console.warn(`No base apy for: GEAR, ${POOL_DICTIONARY.GEAR}`);

  const base = toBN(
    ((baseApy || 0) / CRV_APY_RESPONSE_DECIMALS).toString(),
    WAD_DECIMALS_POW,
  );

  const crv = toBN(
    ((crvApy || 0) / CRV_APY_RESPONSE_DECIMALS).toString(),
    WAD_DECIMALS_POW,
  );

  const gear = BigNumber.from(0);

  return { base, crv, gear };
}

// 1, 2
// https://www.convexfinance.com/api/curve-apys
// factory-crypto-192
// baseApy: 4.086688393333504
// crvApy: 1.1328144118563017

// https://api.curve.fi/api/getSubgraphData/ethereum  "address":"0x0E9B5B092caD6F1c5E6bc7f89Ffe1abb5c95F1C2" -> "latestDailyApy":4.086688393333504
// https://api.curve.fi/api/getPools/ethereum/factory-crypto factory-192 -> gaugeCrvApy
// 0: 0.45111598101215616
// 1: 1.1277899525303905
// https://api.curve.fi/api/getAllGauges GEAR+ETH (0x0E9B…F1C2)
