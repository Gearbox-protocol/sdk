import type { TokenBase } from "./token";
import type { TokenNetwork } from "./tokenType";
import { TokenType } from "./tokenType";

export type WrappedToken = "sfrxETH";

export type WrappedTokenData = {
  symbol: WrappedToken;
  type: Partial<
    Record<TokenNetwork, TokenType.WRAPPED_TOKEN | TokenType.NORMAL_TOKEN>
  >;
} & TokenBase;

export const wrappedTokens: Record<WrappedToken, WrappedTokenData> = {
  sfrxETH: {
    name: "sfrxETH",

    symbol: "sfrxETH",
    type: {
      Mainnet: TokenType.WRAPPED_TOKEN,
      Arbitrum: TokenType.NORMAL_TOKEN,
      Optimism: TokenType.NORMAL_TOKEN,
    },
  },
};

export const isWrappedToken = (t: unknown): t is WrappedToken =>
  typeof t === "string" && !!wrappedTokens[t as WrappedToken];
