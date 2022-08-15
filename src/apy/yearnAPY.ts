import { BigNumber } from "ethers";
import axios from "axios";

import { YearnLPToken, yearnTokens } from "../tokens/yearn";

import { toBN } from "../utils/formatter";

import { WAD_DECIMALS_POW } from "../core/constants";
import { objectEntries } from "../utils/mappers";

interface YearnAPYData {
  apy: {
    gross_apr: number;
    net_apy: number;
  };

  symbol: string;
  display_name: string;
}

type Response = Array<YearnAPYData>;

const RESPONSE_DECIMALS = 1;
const ZERO = BigNumber.from(0);

const URL = "https://api.yearn.finance/v1/chains/1/vaults/all";

export type YearnAPYResult = Record<YearnLPToken, BigNumber>;

const transformSymbol = (s: string) => s.replaceAll("_", "-").toLowerCase();

export async function getYearnAPY(): Promise<YearnAPYResult> {
  try {
    const { data } = await axios.get<Response>(URL);

    const dataBySymbol = data.reduce<Record<string, YearnAPYData>>((acc, d) => {
      acc[d.symbol.toLowerCase()] = d;
      return acc;
    }, {});

    const yearnAPY = objectEntries(yearnTokens).reduce<YearnAPYResult>(
      (acc, [yearnSymbol]) => {
        const { apy } = dataBySymbol[transformSymbol(yearnSymbol)] || {};
        const { net_apy: netApy } = apy || {};

        acc[yearnSymbol] = toBN(
          (netApy / RESPONSE_DECIMALS).toString(),
          WAD_DECIMALS_POW
        );
        return acc;
      },
      {} as YearnAPYResult
    );

    return yearnAPY;
  } catch (e) {
    return {
      yvDAI: ZERO,
      yvUSDC: ZERO,
      yvWETH: ZERO,
      yvWBTC: ZERO,
      yvCurve_stETH: ZERO,
      yvCurve_FRAX: ZERO
    };
  }
}
