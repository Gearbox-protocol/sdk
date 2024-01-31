import {
  TypedObjectUtils,
  WAD_DECIMALS_POW,
  YearnLPToken,
  yearnTokens,
} from "@gearbox-protocol/sdk-gov";
import axios from "axios";

import { toBN } from "../utils/formatter";

interface YearnAPYData {
  apr: {
    netAPR: number;
  };

  address: string;
  symbol: string;
  display_name: string;
}

type Response = Array<YearnAPYData>;

const RESPONSE_DECIMALS = 1;

const URL = "https://ydaemon.yearn.finance/vaults/all?chainids=1&limit=2500";

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
      const symbol = transformSymbol(yearnSymbol);
      const data = dataBySymbol[symbol];
      const { apr: apy } = data || {};
      const { netAPR } = apy || {};
      const netApy = netAPR || 0;

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
