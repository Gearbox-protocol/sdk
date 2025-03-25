import type { Address } from "viem";

import type { NetworkType } from "../../chain/index.js";
import { chains as CHAINS, isSupportedNetwork } from "../../chain/index.js";
import { TypedObjectUtils } from "../../utils/mappers.js";

export const TESTNET_CHAINS: Record<NetworkType, number> = {
  Mainnet: 7878,
  Optimism: 7879,
  Arbitrum: 7880,
  Base: 7881,
  Sonic: 7882,
  // New networks
  MegaETH: 7883,
  Monad: 7884,
  Berachain: 7885,
  Avalanche: 7886,
};

const CHAINS_BY_ID: Record<number, NetworkType> =
  TypedObjectUtils.swapKeyValue(TESTNET_CHAINS);

const MAINNET_BY_TESTNET_ID = TypedObjectUtils.entries(TESTNET_CHAINS).reduce<
  Record<number, number>
>((acc, [n, testnetId]) => {
  const primaryId = CHAINS[n]?.id;
  acc[testnetId] = primaryId;

  return acc;
}, {});

export const getMainnetByTestnet = (testnetId: number): number | undefined =>
  MAINNET_BY_TESTNET_ID[testnetId];
export const getTestNetworkType = (chainId: number): NetworkType | undefined =>
  CHAINS_BY_ID[chainId];
export const isTestNetwork = (chainId: number | undefined): chainId is number =>
  chainId !== undefined && !!CHAINS_BY_ID[chainId];

type ChartsPriceSource = "chainlink" | "spot";

const CHARTS_BACKEND_ADDRESSES: Record<number, string> = {
  ...Object.values(CHAINS).reduce<Record<number, string>>((acc, chain) => {
    acc[chain.id] = "https://charts-server.fly.dev";
    return acc;
  }, {}),

  [TESTNET_CHAINS.Mainnet]: "https://testnet.gearbox.foundation",
  [TESTNET_CHAINS.Arbitrum]: "https://arbtest.gearbox.foundation",
  [TESTNET_CHAINS.Optimism]: "https://opttest.gearbox.foundation",
  // !& new chains
};

const STATIC_TOKEN = "https://static.gearbox.fi/tokens/";

const LEADERBOARD_APIS: Record<number, string> = {
  [CHAINS.Mainnet.id]: "https://gpointbot.fly.dev",
  [CHAINS.Optimism.id]: "https://gpointbot.fly.dev",
  [CHAINS.Arbitrum.id]: "https://gpointbot.fly.dev",
  // !& new chains

  [TESTNET_CHAINS.Mainnet]: "https://testnet.gearbox.foundation/gpointbot",
  [TESTNET_CHAINS.Optimism]: "https://testnet.gearbox.foundation/gpointbot",
  [TESTNET_CHAINS.Arbitrum]: "https://testnet.gearbox.foundation/gpointbot",
  // !& new chains
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

    const relativePath = URLApi.getRelativeUrl(
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
