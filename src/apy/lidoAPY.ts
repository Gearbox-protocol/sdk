import {
  PERCENTAGE_DECIMALS,
  WAD_DECIMALS_POW,
} from "@gearbox-protocol/sdk-gov";
import axios from "axios";

import { toBN } from "../utils/formatter";

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

export async function getLidoAPY() {
  try {
    const res = await axios.get<LidoApyResponse>(LIDO_URL);
    const { smaApr = 0 } = res?.data?.data || {};
    return toBN(String(smaApr), WAD_DECIMALS_POW) / PERCENTAGE_DECIMALS;
  } catch (e) {
    console.error(e);
    return 0n;
  }
}
