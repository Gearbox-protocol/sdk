import type { TokenBase } from "./token.js";
import type { TokenNetwork, TokenType } from "./tokenType.js";

export type WrappedToken = "sfrxETH";

export type WrappedTokenData = {
  symbol: WrappedToken;
  type: Partial<
    Record<TokenNetwork, TokenType.WRAPPED_TOKEN | TokenType.NORMAL_TOKEN>
  >;
} & TokenBase;
