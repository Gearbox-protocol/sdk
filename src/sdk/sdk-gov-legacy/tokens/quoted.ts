import type { NetworkType } from "../../chain";
import type { SupportedToken } from "./token";

export const nonQuoted: Record<NetworkType, Array<SupportedToken>> = {
  Mainnet: ["WETH", "DAI", "USDC", "FRAX"],
  Arbitrum: ["WETH", "DAI", "USDC", "WBTC"],
  Optimism: ["WETH", "USDC", "OP"],
  Base: ["WETH", "USDC", "USDT"],
};
