import {
  CHAINS,
  NetworkType,
  PartialRecord,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  SupportedToken,
  TypedObjectUtils,
} from "@gearbox-protocol/sdk-gov";
import axios from "axios";
import { Address } from "viem";

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

export type YearnAPYResult = PartialRecord<Address, number>;

export async function getYearnAPY(
  network: NetworkType,
  currentTokens: Record<SupportedToken, Address>,
): Promise<YearnAPYResult> {
  try {
    const chainId = CHAINS[network];
    const { data } = await axios.get<Response>(getUrl(chainId));

    const dataByAddress = data.reduce<Record<string, YearnAPYData>>(
      (acc, d) => {
        acc[d.address.toLowerCase()] = d;
        return acc;
      },
      {},
    );

    const yearnAPY = TypedObjectUtils.entries(
      currentTokens,
    ).reduce<YearnAPYResult>((acc, [, address]) => {
      if (!dataByAddress[address]) return acc;

      const data = dataByAddress[address];
      const { apr: apy } = data || {};
      const { netAPR } = apy || {};
      const netApy = netAPR || 0;

      const r = Math.round(
        netApy * Number(PERCENTAGE_FACTOR) * Number(PERCENTAGE_DECIMALS),
      );
      acc[address] = r;

      return acc;
    }, {});

    return yearnAPY;
  } catch (e) {
    return {};
  }
}
