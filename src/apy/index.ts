import {
  LPTokens,
  lpTokens,
  PartialRecord,
  SupportedToken,
} from "@gearbox-protocol/sdk-gov";

export type AdditionalTokenWithAPY = Extract<SupportedToken, "STETH">;
export const additionalTokensWIthAPY: Record<AdditionalTokenWithAPY, true> = {
  STETH: true,
};

export type TokensWithAPY = LPTokens | Extract<SupportedToken, "STETH">;
export type LpTokensAPY = PartialRecord<TokensWithAPY, number>;

export const isTokenWithAPY = (t: unknown): t is TokensWithAPY =>
  typeof t === "string" &&
  (!!lpTokens[t as LPTokens] ||
    !!additionalTokensWIthAPY[t as AdditionalTokenWithAPY]);

export * from "./convexAPY";
export * from "./curveAPY";
export * from "./lidoAPY";
export * from "./yearnAPY";
