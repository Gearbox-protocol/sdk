import { SupportedToken } from "../tokens/token";

export type CmUnderlyingTokens = Extract<
  SupportedToken,
  "DAI" | "USDC" | "WETH" | "WBTC" | "wstETH"
>;

export const CA_GEAR_PER_BLOCK: Record<CmUnderlyingTokens, number> = {
  DAI: 166,
  USDC: 166,
  WETH: 230,
  WBTC: 66,
  wstETH: 118,
};
