import axios from "axios";
import type { Address } from "viem";

import { PERCENTAGE_FACTOR } from "../../constants";
import type { SupportedToken } from "../../sdk-gov-legacy";

interface Apy {
  timeUnix: number;
  apr: number;
}

interface Meta {
  address: Address;
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

export async function getLidoAPY(
  currentTokens: Record<SupportedToken, Address>,
): Promise<Record<Address, number>> {
  const res = await axios.get<LidoApyResponse>(LIDO_URL);
  const { smaApr = 0 } = res?.data?.data || {};

  const r = Math.round(smaApr * Number(PERCENTAGE_FACTOR));
  return {
    [currentTokens.STETH]: r,
    [currentTokens.wstETH]: r,
  };
}
