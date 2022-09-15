import { LPTokens, SupportedToken } from "../tokens/token";

export type TokensWithAPY = LPTokens | Extract<SupportedToken, "STETH">;
export type LpTokensAPY = Record<TokensWithAPY, number>;

export * from "./convexAPY";
export * from "./curveAPY";
export * from "./lidoAPY";
export * from "./yearnAPY";
