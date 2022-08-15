import { LPTokens, SupportedToken } from "../tokens/token";

export type TokensWithAPY = LPTokens | Extract<SupportedToken, "LDO">;

export * from "./convexAPY";
export * from "./lidoAPY";
export * from "./curveAPY";
