import axios from "axios";
import type { Address } from "viem";

import { PERCENTAGE_DECIMALS, PERCENTAGE_FACTOR } from "../../constants";
import type { SupportedToken } from "../../sdk-gov-legacy";

type APYResponse = [
  {
    sky_savings_rate_apy: string;
    sky_farm_apy: string;
  },
];

const getAPYURL = () => "https://info-sky.blockanalitica.com/api/v1/overall/";

export async function getSkyAPY(
  currentTokens: Record<SupportedToken, Address>,
): Promise<Record<Address, number>> {
  try {
    const resp = await axios.get<APYResponse>(getAPYURL());
    const apyInfo = resp?.data?.[0];

    const savingsRate = apyInfo?.sky_savings_rate_apy || 0;
    const farmRate = apyInfo?.sky_farm_apy || 0;

    return {
      [currentTokens.sUSDS]: numberToAPY(Number(savingsRate)),
      [currentTokens.stkUSDS]: numberToAPY(Number(farmRate)),
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
