import axios from "axios";
import type { Address } from "viem";

import { PERCENTAGE_DECIMALS, PERCENTAGE_FACTOR } from "../../constants";
import type { SupportedToken } from "../../sdk-gov-legacy";

interface APYResponse {
  underlyingInterestApy: number;
}

const getAPYURL = () =>
  "https://api-v2.pendle.finance/core/v2/1/markets/0xcdd26eb5eb2ce0f203a84553853667ae69ca29ce/data";

export async function getPendleAPY(
  currentTokens: Record<SupportedToken, Address>,
): Promise<Record<Address, number>> {
  try {
    const resp = await axios.get<APYResponse>(getAPYURL());
    const apyInfo = resp?.data;

    const rate = apyInfo?.underlyingInterestApy || 0;

    return {
      [currentTokens.sUSDe]: numberToAPY(Number(rate)),
    };
  } catch (e) {
    return {};
  }
}

function numberToAPY(baseApy: number) {
  return Math.round(
    baseApy * Number(PERCENTAGE_FACTOR) * Number(PERCENTAGE_DECIMALS),
  );
}
