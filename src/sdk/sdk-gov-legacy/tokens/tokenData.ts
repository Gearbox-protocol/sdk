import type { Address } from "viem";

import type { NetworkType } from "../../chain";
import { NOT_DEPLOYED } from "../../constants";
import type { SupportedToken } from "./token";
import { tokenDataByNetwork } from "./token";

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
  ],
  Arbitrum: ["WETH", "DAI", "USDC", "USDT", "rETH", "USDC_e", "wstETH"],
  Optimism: ["WETH", "USDC", "USDT", "USDC_e", "wstETH"],
  Base: ["WETH", "USDC", "USDT"],
  Sonic: ["wS"],
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
