import {
  CHAINS,
  isSupportedNetwork,
  NetworkType,
} from "@gearbox-protocol/sdk-gov";

export const TESTNET_CHAINS: Record<NetworkType, number> = {
  Mainnet: 7878,
  Optimism: 7879,
  Arbitrum: 7880,
  Base: 7881,
};

type ChartsPriceSource = "chainlink" | "spot";

const CHARTS_BACKEND_ADDRESSES: Record<number, string> = {
  [CHAINS.Mainnet]: "https://charts-server.fly.dev",
  [CHAINS.Arbitrum]: "https://charts-server.fly.dev",
  [CHAINS.Optimism]: "https://charts-server.fly.dev",
  [CHAINS.Base]: "https://charts-server.fly.dev",
  [CHAINS.Local]: "https://charts-server.fly.dev",

  [TESTNET_CHAINS.Mainnet]: "https://testnet.gearbox.foundation",
  [TESTNET_CHAINS.Arbitrum]: "https://arbtest.gearbox.foundation",
  [TESTNET_CHAINS.Optimism]: "https://opttest.gearbox.foundation",
  // !& Base
};

const LAMA_URL = "https://charts-server.fly.dev/api/defillama?ids=";

const STATIC_TOKEN = "https://static.gearbox.fi/tokens/";

export class GearboxBackendApi {
  static getChartsUrl = (
    url: string,
    chainId: number,
    options: Options = { params: {} },
    priceSource?: ChartsPriceSource,
  ) => {
    const domain = CHARTS_BACKEND_ADDRESSES[chainId];
    const priceSourceArr = priceSource ? [priceSource] : [];

    const isMain = isSupportedNetwork(chainId);
    const isLocal = CHAINS.Local === chainId;

    const relativePath = URLApi.getRelativeUrl(
      url,
      isMain
        ? {
            ...options,
            params: { ...options.params, chainId: isLocal ? 1 : chainId },
          }
        : options,
    );

    return [domain, "api", ...priceSourceArr, relativePath].join("/");
  };

  static getLlamaAPYUrl = (idList: Array<string>) => {
    return `${LAMA_URL}${idList.join(",")}`;
  };
}

interface Options {
  params?: Record<string, string | number>;
}

export class URLApi {
  static getRelativeUrl = (url: string, options?: Options) => {
    const { params = {} } = options || {};

    const paramsString = Object.entries(params)
      .map<string>(([key, value]) => `${key}=${value}`)
      .join("&");

    return [url, ...(paramsString ? [paramsString] : [])].join("?");
  };
}
