import type { NetworkType } from "../../chain/index.js";
import type { SupportedToken } from "./token.js";

export const nonQuoted: Record<NetworkType, Array<SupportedToken>> = {
  Mainnet: ["WETH", "DAI", "USDC", "FRAX"],
  Arbitrum: ["WETH", "DAI", "USDC", "WBTC"],
  Optimism: ["WETH", "USDC", "OP"],
  Base: ["WETH", "USDC", "USDT"],
  Sonic: [],
};
