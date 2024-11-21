import {
  PartialRecord,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  SupportedToken,
} from "@gearbox-protocol/sdk-gov";
import axios from "axios";

type APYResponse = [
  {
    sky_savings_rate_apy: string;
    sky_farm_apy: string;
  },
];

const getAPYURL = () => "https://info-sky.blockanalitica.com/api/v1/overall/";

type SkyTokens = Extract<SupportedToken, "sUSDS" | "stkUSDS">;

export type SkyAPYResult = PartialRecord<SkyTokens, number>;

export async function getSkyAPY(): Promise<SkyAPYResult> {
  try {
    const resp = await axios.get<APYResponse>(getAPYURL());
    const apyInfo = resp?.data?.[0];

    const savingsRate = apyInfo?.sky_savings_rate_apy || 0;
    const farmRate = apyInfo?.sky_farm_apy || 0;

    return {
      sUSDS: numberToAPY(Number(savingsRate)),
      stkUSDS: numberToAPY(Number(farmRate)),
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
