import { CHAINS } from "@gearbox-protocol/sdk-gov";

export const GEARBOX_RPC_CHAIN_ID = 7878;

type ChartsPriceSource = "chainlink" | "spot";

const CHARTS_BACKEND_ADDRESSES: Record<number, string> = {
  [CHAINS.Mainnet]: "https://charts-server.fly.dev",
  [CHAINS.Local]: "https://charts-server.fly.dev",
  [GEARBOX_RPC_CHAIN_ID]: "https://testnet.gearbox.foundation",
};

interface Options {
  params?: Record<string, string | number>;
}

export class ChartsApi {
  static getUrl = (
    url: string,
    chainId: number,
    options?: Options,
    priceSource?: ChartsPriceSource,
  ) =>
    [
      CHARTS_BACKEND_ADDRESSES[chainId],
      "api",
      ...(priceSource ? [priceSource] : []),
      this.getRelativeUrl(url, options),
    ].join("/");

  private static getRelativeUrl = (url: string, options?: Options) => {
    const { params = {} } = options || {};

    const paramsString = Object.entries(params)
      .map<string>(([key, value]) => `${key}=${value}`)
      .join("&");

    return [url, ...(paramsString ? [paramsString] : [])].join("?");
  };
}
