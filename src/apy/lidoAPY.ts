import axios from "axios";
import { BigNumber } from "ethers";

import { PERCENTAGE_DECIMALS, WAD_DECIMALS_POW } from "../core/constants";
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
    return toBN(String(smaApr), WAD_DECIMALS_POW).div(PERCENTAGE_DECIMALS);
  } catch (e) {
    console.error(e);
    return BigNumber.from(0);
  }
}
