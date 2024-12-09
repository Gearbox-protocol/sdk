import { PERCENTAGE_FACTOR, SupportedToken } from "@gearbox-protocol/sdk-gov";
import axios from "axios";
import { Address } from "viem";

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
