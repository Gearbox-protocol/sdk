import { CHAINS, NetworkType } from "@gearbox-protocol/sdk-gov";

export const TESTNET_CHAINS: Record<NetworkType, number> = {
  Mainnet: 7878,
  Optimism: 7879,
  Arbitrum: 7880,
  Base: 7881,
};

type ChartsPriceSource = "chainlink" | "spot";

const CHARTS_BACKEND_ADDRESSES: Record<number, string> = {
  [CHAINS.Mainnet]: "https://charts-server.fly.dev",
  [CHAINS.Arbitrum]: "https://arbitrum.gearbox.foundation",
  [CHAINS.Optimism]: "https://optimism.gearbox.foundation",
  // !& Base

  [CHAINS.Local]: "https://charts-server.fly.dev",
  [TESTNET_CHAINS.Mainnet]: "https://testnet.gearbox.foundation",
  [TESTNET_CHAINS.Arbitrum]: "https://arbtest.gearbox.foundation",
  [TESTNET_CHAINS.Optimism]: "https://opttest.gearbox.foundation",
  // !& Base
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

  static getRelativeUrl = (url: string, options?: Options) => {
    const { params = {} } = options || {};

    const paramsString = Object.entries(params)
      .map<string>(([key, value]) => `${key}=${value}`)
      .join("&");

    return [url, ...(paramsString ? [paramsString] : [])].join("?");
  };
}
