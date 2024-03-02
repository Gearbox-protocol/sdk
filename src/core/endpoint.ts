import { CHAINS } from "@gearbox-protocol/sdk-gov";

export const TESTNET_CHAINS = {
  Mainnet: 7878,
  Optimism: 7879,
  Arbitrum: 7880,
} as const;

type ChartsPriceSource = "chainlink" | "spot";

const CHARTS_BACKEND_ADDRESSES: Record<number, string> = {
  [CHAINS.Mainnet]: "https://charts-server.fly.dev",
  [CHAINS.Arbitrum]: "https://arbitrum.gearbox.foundation",

  [CHAINS.Local]: "https://charts-server.fly.dev",
  [TESTNET_CHAINS.Mainnet]: "https://testnet.gearbox.foundation",
  // !& test server for Optimism
  [TESTNET_CHAINS.Optimism]: "https://testnet.gearbox.foundation",
  [TESTNET_CHAINS.Arbitrum]: "https://arbtest.gearbox.foundation",
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
