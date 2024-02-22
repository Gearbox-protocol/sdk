import {
  CHAINS,
  NetworkType,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  tokenDataByNetwork,
  TypedObjectUtils,
  YearnLPToken,
  yearnTokens,
} from "@gearbox-protocol/sdk-gov";
import axios from "axios";

interface YearnAPYData {
  apr: {
    netAPR: number;
  };

  address: string;
  symbol: string;
  display_name: string;
}

type Response = Array<YearnAPYData>;

const getUrl = (chainId: number) =>
  `https://ydaemon.yearn.finance/vaults/all?chainids=${chainId}&limit=2500`;

export type YearnAPYResult = Record<YearnLPToken, number>;

export async function getYearnAPY(
  network: NetworkType,
): Promise<YearnAPYResult> {
  try {
    const chainId = CHAINS[network];
    const currentTokens = tokenDataByNetwork[network];

    const { data } = await axios.get<Response>(getUrl(chainId));

    const dataByAddress = data.reduce<Record<string, YearnAPYData>>(
      (acc, d) => {
        acc[d.address.toLowerCase()] = d;
        return acc;
      },
      {},
    );

    const yearnAPY = TypedObjectUtils.entries(
      yearnTokens,
    ).reduce<YearnAPYResult>((acc, [yearnSymbol]) => {
      const address = (currentTokens?.[yearnSymbol] || "").toLowerCase();

      const data = dataByAddress[address];
      const { apr: apy } = data || {};
      const { netAPR } = apy || {};
      const netApy = netAPR || 0;

      const r = Math.round(
        netApy * Number(PERCENTAGE_FACTOR) * Number(PERCENTAGE_DECIMALS),
      );
      acc[yearnSymbol] = r;

      return acc;
    }, {} as YearnAPYResult);

    return yearnAPY;
  } catch (e) {
    return {} as YearnAPYResult;
  }
}
