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

const LEADERBOARD_APIS: Record<number, string> = {
  [CHAINS.Mainnet]: "https://gpointbot.fly.dev",
  [CHAINS.Optimism]: "https://gpointbot.fly.dev",
  [CHAINS.Arbitrum]: "https://gpointbot.fly.dev",

  [CHAINS.Local]: "https://gpointbot.fly.dev",
  [TESTNET_CHAINS.Mainnet]: "https://testnet.gearbox.foundation/gpointbot",
  [TESTNET_CHAINS.Optimism]: "https://testnet.gearbox.foundation/gpointbot",
  [TESTNET_CHAINS.Arbitrum]: "https://testnet.gearbox.foundation/gpointbot",
};

const TRADING_GRAPHS_API: Record<number, string> = {
  [CHAINS.Mainnet]: "https://trading-price.fly.dev/api/tradingview",
  [CHAINS.Optimism]: "https://trading-price.fly.dev/api/tradingview",
  [CHAINS.Arbitrum]: "https://trading-price.fly.dev/api/tradingview",

  [CHAINS.Local]: "https://trading-price.fly.dev/api/tradingview",
  [TESTNET_CHAINS.Mainnet]:
    "https://testnet.gearbox.foundation/api/tradingview",
  [TESTNET_CHAINS.Optimism]:
    "https://testnet.gearbox.foundation/api/tradingview",
  [TESTNET_CHAINS.Arbitrum]:
    "https://testnet.gearbox.foundation/api/tradingview",
};

const TRADING_PRICES_API_WS: Record<number, string> = {
  [CHAINS.Mainnet]: "wss://trading-price.fly.dev/api/tradingview/ws",
  [CHAINS.Optimism]: "wss://trading-price.fly.dev/api/tradingview/ws",
  [CHAINS.Arbitrum]: "wss://trading-price.fly.dev/api/tradingview/ws",

  [CHAINS.Local]: "wss://trading-price.fly.dev/api/tradingview/ws",
  [TESTNET_CHAINS.Mainnet]:
    "wss://testnet.gearbox.foundation/api/tradingview/ws",
  [TESTNET_CHAINS.Optimism]:
    "wss://testnet.gearbox.foundation/api/tradingview/ws",
  [TESTNET_CHAINS.Arbitrum]:
    "wss://testnet.gearbox.foundation/api/tradingview/ws",
};

const TRADING_SESSIONS_API_WS: Record<number, string> = {
  [CHAINS.Mainnet]: "wss://gearbox-ws.fly.dev/ws",
  [CHAINS.Optimism]: "wss://optimism.gearbox.foundation/gearbox-ws/ws",
  [CHAINS.Arbitrum]: "wss://arbitrum.gearbox.foundation/gearbox-ws/ws",

  [CHAINS.Local]: "wss://gearbox-ws.fly.dev/ws",
  [TESTNET_CHAINS.Mainnet]: "wss://testnet.gearbox.foundation/gearbox-ws/ws",
  [TESTNET_CHAINS.Optimism]: "wss://opttest.gearbox.foundation/gearbox-ws/ws",
  [TESTNET_CHAINS.Arbitrum]: "wss://arbtest.gearbox.foundation/gearbox-ws/ws",
};

const TRADING_SESSIONS_API: Record<number, string> = {
  [CHAINS.Mainnet]: "https://gearbox-ws.fly.dev",
  [CHAINS.Optimism]: "https://optimism.gearbox.foundation/gearbox-ws",
  [CHAINS.Arbitrum]: "https://arbitrum.gearbox.foundation/gearbox-ws",

  [CHAINS.Local]: "https://gearbox-ws.fly.dev",
  [TESTNET_CHAINS.Mainnet]: "https://testnet.gearbox.foundation/gearbox-ws",
  [TESTNET_CHAINS.Optimism]: "https://opttest.gearbox.foundation/gearbox-ws",
  [TESTNET_CHAINS.Arbitrum]: "https://arbtest.gearbox.foundation/gearbox-ws",
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

  static getTradingGraphsUrl = (url: string, chainId: number) => {
    return `${TRADING_GRAPHS_API[chainId]}${url}`;
  };

  static getTradingPricesWSUrl = (url: string, chainId: number) => {
    return `${TRADING_PRICES_API_WS[chainId]}${url}`;
  };

  static getTradingSessionsWSUrl = (url: string, chainId: number) => {
    return `${TRADING_SESSIONS_API_WS[chainId]}${url}`;
  };

  static getTradingSessionsUrl = (url: string, chainId: number) => {
    return `${TRADING_SESSIONS_API[chainId]}${url}`;
  };

  static getReferralUrl = () => REFERRAL_API;
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
