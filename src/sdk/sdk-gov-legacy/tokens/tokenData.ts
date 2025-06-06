import type { Address } from "viem";

import type { NetworkType } from "../../chain/index.js";
import { NOT_DEPLOYED } from "../../constants/index.js";
import type { SupportedToken } from "./token.js";
import { tokenDataByNetwork } from "./token.js";

export const connectors: Record<NetworkType, Array<SupportedToken>> = {
  Mainnet: [
    "WETH",
    "DAI",
    "USDC",
    "USDe",
    "FRAX",
    "rETH",
    "ezETH",
    "GHO",
    "weETH",
    "wstETH",
    "STETH",
    "WBTC",
    "USDS",
    "eBTC",
    "LBTC",
    "solvBTC",
    "pumpBTC",
    "waEthLidowstETH",
    "beraSTONE",
  ],
  Arbitrum: ["WETH", "DAI", "USDC", "USDT", "rETH", "USDC_e", "wstETH"],
  Optimism: ["WETH", "USDC", "USDT", "USDC_e", "wstETH"],
  Base: ["WETH", "USDC", "USDT"],
  Sonic: ["wS"],
  // New networks
  MegaETH: [],
  Monad: [],
  Berachain: [],
  Avalanche: [],
  BNB: [],
  WorldChain: [],
  Etherlink: [],
};

export function getConnectors(networkType: NetworkType): Address[] {
  return connectors[networkType].map(e => {
    const result = tokenDataByNetwork[networkType][e];

    if (!result || result === NOT_DEPLOYED) {
      throw new Error(`connector token ${e} not found`);
    }

    return result.toLowerCase() as Address;
  });
}
