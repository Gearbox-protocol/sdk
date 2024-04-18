import { PartialRecord, PERCENTAGE_FACTOR } from "@gearbox-protocol/sdk-gov";
import axios from "axios";

import { TokensWithAPY } from ".";

interface Apy {
  timeUnix: number;
  apr: number;
}

interface Meta {
  address: string;
  chainId: number;
  symbol: string;
}

interface LidoApyResponse {
  data: {
    aprs: Array<Apy>;
    smaApr: number;
  };
  meta: Meta;
}

const LIDO_URL = "https://eth-api.lido.fi/v1/protocol/steth/apr/sma";

export type LidoAPYResult = PartialRecord<
  Extract<TokensWithAPY, "STETH" | "wstETH">,
  number
>;

export async function getLidoAPY(): Promise<LidoAPYResult> {
  const res = await axios.get<LidoApyResponse>(LIDO_URL);
  const { smaApr = 0 } = res?.data?.data || {};

  const r = Math.round(smaApr * Number(PERCENTAGE_FACTOR));
  return {
    STETH: r,
    wstETH: r,
  };
}
