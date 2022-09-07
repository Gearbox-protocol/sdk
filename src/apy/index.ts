import { LPTokens, SupportedToken } from "../tokens/token";

export type TokensWithAPY = LPTokens | Extract<SupportedToken, "LDO">;
export type LpTokensAPY = Record<TokensWithAPY, number>;

export * from "./convexAPY";
export * from "./curveAPY";
export * from "./lidoAPY";
export * from "./yearnAPY";
