import { NetworkType } from "../core/chains";
import { SupportedToken } from "./token";

export const nonQuoted: Record<NetworkType, Array<SupportedToken>> = {
  Mainnet: ["WETH", "DAI", "USDC", "FRAX"],
  Arbitrum: ["WETH", "DAI", "USDC", "WBTC"],
};
