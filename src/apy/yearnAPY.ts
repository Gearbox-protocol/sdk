import {
  TypedObjectUtils,
  WAD_DECIMALS_POW,
  YearnLPToken,
  yearnTokens,
} from "@gearbox-protocol/sdk-gov";
import axios from "axios";

import { toBN } from "../utils/formatter";

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

const URL = "https://api.yexporter.io/v1/chains/1/vaults/all";

export type YearnAPYResult = Record<YearnLPToken, bigint>;

const transformSymbol = (s: string) => s.replaceAll("_", "-").toLowerCase();

export async function getYearnAPY(): Promise<YearnAPYResult | null> {
  try {
    const { data } = await axios.get<Response>(URL);

    const dataBySymbol = data.reduce<Record<string, YearnAPYData>>((acc, d) => {
      acc[d.symbol.toLowerCase()] = d;
      return acc;
    }, {});

    const yearnAPY = TypedObjectUtils.entries(
      yearnTokens,
    ).reduce<YearnAPYResult>((acc, [yearnSymbol]) => {
      const { apy } = dataBySymbol[transformSymbol(yearnSymbol)] || {};
      const { net_apy: netApy = 0 } = apy || {};

      acc[yearnSymbol] = toBN(
        (netApy / RESPONSE_DECIMALS).toString(),
        WAD_DECIMALS_POW,
      );
      return acc;
    }, {} as YearnAPYResult);

    return yearnAPY;
  } catch (e) {
    return null;
  }
}
