import type { SupportedToken, TokenBase } from "./token.js";
import type { TokenNetwork } from "./tokenType.js";
import { TokenType } from "./tokenType.js";

export type ZircuitStakedPhantomToken = "zpufETH";

export type ZircuitPhantomTokenData = {
  symbol: ZircuitStakedPhantomToken;
  type: Partial<Record<TokenNetwork, TokenType.ZIRCUIT_STAKED_TOKEN>>;
  underlying: SupportedToken;
} & TokenBase;

export const zircuitStakedPhantomTokens: Record<
  ZircuitStakedPhantomToken,
  ZircuitPhantomTokenData
> = {
  zpufETH: {
    name: "Zircuit staked pufETH",
    symbol: "zpufETH",
    type: {
      AllNetworks: TokenType.ZIRCUIT_STAKED_TOKEN,
    },
    underlying: "pufETH",
  },
};

export const zircuitTokens: Record<
  ZircuitStakedPhantomToken,
  ZircuitPhantomTokenData
> = {
  ...zircuitStakedPhantomTokens,
};

export const isZircuitStakedPhantomToken = (
  t: unknown,
): t is ZircuitStakedPhantomToken =>
  typeof t === "string" && !!zircuitTokens[t as ZircuitStakedPhantomToken];

export const zircuitStakedTokenByToken = Object.values(
  zircuitStakedPhantomTokens,
).reduce<Partial<Record<SupportedToken, SupportedToken>>>((acc, value) => {
  acc[value.underlying] = value.symbol;
  return acc;
}, {});
