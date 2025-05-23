import type { NormalToken } from "./normal.js";
import type { TokenBase } from "./token.js";
import type { TokenNetwork } from "./tokenType.js";
import { TokenType } from "./tokenType.js";

export type AaveV2LPToken = "aDAI" | "aUSDC" | "aWETH" | "aUSDT";
export type WrappedAaveV2LPToken = "waDAI" | "waUSDC" | "waWETH" | "waUSDT";

export type AaveV2PoolTokenData = {
  symbol: AaveV2LPToken;
  type: Partial<Record<TokenNetwork, TokenType.AAVE_V2_A_TOKEN>>;
  underlying: NormalToken;
} & TokenBase;

export type WrappedAaveV2PoolTokenData = {
  symbol: WrappedAaveV2LPToken;
  type: Partial<Record<TokenNetwork, TokenType.WRAPPED_AAVE_V2_TOKEN>>;
  underlying: AaveV2LPToken;
} & TokenBase;

export const aaveV2Tokens: Record<AaveV2LPToken, AaveV2PoolTokenData> = {
  aDAI: {
    name: "AaveV2 aDAI",
    symbol: "aDAI",
    type: {
      AllNetworks: TokenType.AAVE_V2_A_TOKEN,
    },
    underlying: "DAI",
  },

  aUSDC: {
    name: "AaveV2 aUSDC",
    symbol: "aUSDC",
    type: {
      AllNetworks: TokenType.AAVE_V2_A_TOKEN,
    },
    underlying: "USDC",
  },

  aUSDT: {
    name: "AaveV2 aUSDT",
    symbol: "aUSDT",
    type: {
      AllNetworks: TokenType.AAVE_V2_A_TOKEN,
    },
    underlying: "USDT",
  },

  aWETH: {
    name: "AaveV2 aWETH",
    symbol: "aWETH",
    type: {
      AllNetworks: TokenType.AAVE_V2_A_TOKEN,
    },
    underlying: "WETH",
  },
};

export const wrappedAaveV2Tokens: Record<
  WrappedAaveV2LPToken,
  WrappedAaveV2PoolTokenData
> = {
  waDAI: {
    name: "Wrapped AaveV2 aDAI",
    symbol: "waDAI",
    type: {
      AllNetworks: TokenType.WRAPPED_AAVE_V2_TOKEN,
    },
    underlying: "aDAI",
  },

  waUSDC: {
    name: "Wrapped AaveV2 aUSDC",
    symbol: "waUSDC",
    type: {
      AllNetworks: TokenType.WRAPPED_AAVE_V2_TOKEN,
    },
    underlying: "aUSDC",
  },

  waUSDT: {
    name: "Wrapped AaveV2 aUSDT",
    symbol: "waUSDT",
    type: {
      AllNetworks: TokenType.WRAPPED_AAVE_V2_TOKEN,
    },
    underlying: "aUSDT",
  },

  waWETH: {
    name: "Wrapped AaveV2 aWETH",
    symbol: "waWETH",
    type: {
      AllNetworks: TokenType.WRAPPED_AAVE_V2_TOKEN,
    },
    underlying: "aWETH",
  },
};
