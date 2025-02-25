import {
  CHAINS,
  isSupportedNetwork,
  NetworkType,
} from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

export const TESTNET_CHAINS: Record<NetworkType, number> = {
  Mainnet: 7878,
  Optimism: 7879,
  Arbitrum: 7880,
  Base: 7881,
  Sonic: 7882,
};

type ChartsPriceSource = "chainlink" | "spot";

const CHARTS_BACKEND_ADDRESSES: Record<number, string> = {
  [CHAINS.Mainnet]: "https://charts-server.fly.dev",
  [CHAINS.Arbitrum]: "https://charts-server.fly.dev",
  [CHAINS.Optimism]: "https://charts-server.fly.dev",
  [CHAINS.Base]: "https://charts-server.fly.dev",
  [CHAINS.Local]: "https://charts-server.fly.dev",
  [CHAINS.Sonic]: "https://charts-server.fly.dev",

  [TESTNET_CHAINS.Mainnet]: "https://testnet.gearbox.foundation",
  [TESTNET_CHAINS.Arbitrum]: "https://arbtest.gearbox.foundation",
  [TESTNET_CHAINS.Optimism]: "https://opttest.gearbox.foundation",
  // !& Base & Sonic
};

const LAMA_URL = "https://charts-server.fly.dev/api/defillama?ids=";

const STATIC_TOKEN = "https://static.gearbox.fi/tokens/";

const LEADERBOARD_APIS: Record<number, string> = {
  [CHAINS.Mainnet]: "https://gpointbot.fly.dev",
  [CHAINS.Optimism]: "https://gpointbot.fly.dev",
  [CHAINS.Arbitrum]: "https://gpointbot.fly.dev",
  [CHAINS.Sonic]: "https://gpointbot.fly.dev",

  [CHAINS.Local]: "https://gpointbot.fly.dev",
  [TESTNET_CHAINS.Mainnet]: "https://testnet.gearbox.foundation/gpointbot",
  [TESTNET_CHAINS.Optimism]: "https://testnet.gearbox.foundation/gpointbot",
  [TESTNET_CHAINS.Arbitrum]: "https://testnet.gearbox.foundation/gpointbot",
  [TESTNET_CHAINS.Base]: "https://testnet.gearbox.foundation/gpointbot",
  [TESTNET_CHAINS.Sonic]: "https://testnet.gearbox.foundation/gpointbot",
};

const REFERRAL_API = "https://referral-gen.fly.dev/generate";

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

  static getLeaderboardUrl = (url: string, chainId: number) => {
    return `${LEADERBOARD_APIS[chainId]}${url}`;
  };

  static getReferralUrl = () => REFERRAL_API;

  static apyServerAllRewards = (chainId: number) =>
    URLApi.getRelativeUrl("https://apy-server.fly.dev/api/rewards/tokens/all", {
      params: { chain_id: chainId },
    });
  static apyServerGearAPY = (chainId: number) =>
    URLApi.getRelativeUrl("https://apy-server.fly.dev/api/rewards/gear-apy", {
      params: { chain_id: chainId },
    });
  static apyServerAllPoolRewards = (chainId: number) =>
    URLApi.getRelativeUrl("https://apy-server.fly.dev/api/rewards/pools/all", {
      params: { chain_id: chainId },
    });
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
