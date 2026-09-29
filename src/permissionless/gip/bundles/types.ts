import type { Address } from "viem";
import type { MarketActions } from "../core/actions/index.js";

export type Bundle = {
  name: string; // should be unique
  tokenIn: Address[];
  tokenOut: Address[];
  actions: MarketActions[];
  enabledTokens: number;
  warning: string | undefined;
};

const fluidDexWarning = (link: string) =>
  `Most routing for this token now goes through Fluid DEX, creating a single-venue dependency. During volatility, Fluid pools can skew hard to one side and block swaps, causing sudden liquidity gaps. Consider this risk when configuring market's parameters.\nTo check up-to date liquidity profile, use ${link} or other DEX aggregators.\n`;

export const BUNDLE_WARNING: Record<string, string | undefined> = {
  "Convex-staked scrvUSD/sUSDe strategy": fluidDexWarning(
    "https://kyberswap.com/swap/ethereum/susde-to-usdc",
  ),
  "USDe strategy": fluidDexWarning(
    "https://kyberswap.com/swap/ethereum/usde-to-usdc",
  ),
  "sUSDe strategy": fluidDexWarning(
    "https://kyberswap.com/swap/ethereum/susde-to-usdc",
  ),
  "WETH strategy": undefined,
  "csUSDL strategy": undefined,
  "Convex-staked RLUSD/USDC strategy": undefined,
};
