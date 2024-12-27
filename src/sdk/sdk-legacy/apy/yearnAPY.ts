import axios from "axios";
import type { Address } from "viem";

import type { NetworkType } from "../../chain";
import { chains } from "../../chain";
import { PERCENTAGE_DECIMALS, PERCENTAGE_FACTOR } from "../../constants";
import type { SupportedToken } from "../../sdk-gov-legacy";
import { TypedObjectUtils } from "../../utils";

interface YearnAPYData {
  apr: {
    netAPR: number;
  };

  address: Address;
  symbol: string;
  display_name: string;
}

type Response = Array<YearnAPYData>;

const getUrl = (chainId: number) =>
  `https://ydaemon.yearn.finance/vaults/all?chainids=${chainId}&limit=2500`;

export async function getYearnAPY(
  network: NetworkType,
  currentTokens: Record<SupportedToken, Address>,
): Promise<Record<Address, number>> {
  try {
    const chain = chains[network];
    const { data } = await axios.get<Response>(getUrl(chain.id));

    const dataByAddress = data.reduce<Record<string, YearnAPYData>>(
      (acc, d) => {
        acc[d.address.toLowerCase()] = d;
        return acc;
      },
      {},
    );

    const yearnAPY = TypedObjectUtils.entries(currentTokens).reduce<
      Record<Address, number>
    >((acc, [, address]) => {
      if (!dataByAddress[address]) return acc;

      const data = dataByAddress[address];
      const { apr: apy } = data || {};
      const { netAPR } = apy || {};
      const netApy = netAPR || 0;

      const r = numberToAPY(netApy);
      acc[address] = r;

      return acc;
    }, {});

    return yearnAPY;
  } catch (e) {
    return {};
  }
}

function numberToAPY(baseApy: number) {
  return Math.round(
    baseApy * Number(PERCENTAGE_FACTOR) * Number(PERCENTAGE_DECIMALS),
  );
}
