import {
  PartialRecord,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  SupportedToken,
} from "@gearbox-protocol/sdk-gov";
import axios from "axios";
import { Address } from "viem";

interface SavingsResponse {
  ssr_rate: string;
}

interface FarmResponse {
  sky_farm: {
    apy: string;
  };
}

const getSavingsURL = () =>
  `https://info-sky.blockanalitica.com/save/?format=json`;
const getFarmingURL = () =>
  `https://info-sky.blockanalitica.com/farms/?format=json`;

type SkyTokens = Extract<SupportedToken, "sUSDS" | "stkUSDS">;

export type SkyAPYResult = PartialRecord<SkyTokens, number>;

export async function getSkyAPY(
  currentTokens: Record<SupportedToken, Address>,
): Promise<SkyAPYResult> {
  try {
    const [savings, farm] = await Promise.all([
      axios.get<SavingsResponse>(getSavingsURL()),
      axios.get<FarmResponse>(getFarmingURL()),
    ]);

    const savingsRate = savings?.data?.ssr_rate || 0;
    const farmRate = farm?.data?.sky_farm.apy || 0;

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
