import type { Address } from "viem";
import { isSupportedNetwork, type NetworkType } from "../../sdk/index.js";

type ChartsPriceSource = "chainlink" | "spot";

const CHARTS_BACKEND_ADDRESS = "https://charts-server.fly.dev";

const STATIC_TOKEN = "https://static.gearbox.finance/tokens/";

/**
 * Centralized endpoint builder for Gearbox backend resources.
 *
 * This utility exposes static helpers that compose canonical URLs for:
 * - charts backend API routes
 * - static token metadata
 * - rewards and NFT merkle proof files
 * - APY state cache snapshots
 *
 * The class is intentionally non-instantiable and is used as a pure
 * namespace of URL-construction functions.
 */
export class GearboxBackendApi {
  private constructor() {}

  static getChartsUrl = (
    url: string,
    chainId: number,
    options: Options = { params: {} },
    priceSource?: ChartsPriceSource,
  ) => {
    const domain = CHARTS_BACKEND_ADDRESS;
    const priceSourceArr = priceSource ? [priceSource] : [];

    const isMain = isSupportedNetwork(chainId);

    const relativePath = getRelativeUrl(
      url,
      isMain
        ? {
            ...options,
            params: { ...options.params, chainId: chainId },
          }
        : options,
    );

    return [domain, "api", ...priceSourceArr, relativePath].join("/");
  };

  static getStaticTokenUrl = () => STATIC_TOKEN;

  static getRewardsMerkleUrl = (
    network: NetworkType,
    root: Address,
    account: Address,
  ) => {
    const path = `${network}_${root.slice(2)}/${account.slice(2, 4)}`;
    const url = `https://am.gearbox.finance/${path.toLowerCase()}.json`;

    return url;
  };

  static getNFTMerkleUrl = (network: NetworkType, root: Address) => {
    const url = `https://dm.gearbox.finance/${network.toLowerCase()}_${root}.json`;

    return url;
  };

  static apyAllRewards = () =>
    getRelativeUrl(
      "https://state-cache.gearbox.foundation/apy-server/latest.json",
    );
}

interface Options {
  params?: Record<string, string | number>;
}

const getRelativeUrl = (url: string, options?: Options) => {
  const { params = {} } = options || {};

  const paramsString = Object.entries(params)
    .map<string>(([key, value]) => `${key}=${value}`)
    .join("&");

  return [url, ...(paramsString ? [paramsString] : [])].join("?");
};
