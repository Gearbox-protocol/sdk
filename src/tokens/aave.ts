import type { AaveV2PoolContract } from "../contracts/contracts";
import { NormalToken } from "./normal";
import type { TokenBase } from "./token";
import { TokenType } from "./tokenType";

export type AaveV2LPToken = "aDAI" | "aUSDC" | "aWETH" | "aUSDT";
export type WrappedAaveV2LPToken = "waDAI" | "waUSDC" | "waWETH" | "waUSDT";

export type AaveV2PoolTokenData = {
  symbol: AaveV2LPToken;
  type: TokenType.AAVE_V2_A_TOKEN;
  underlying: NormalToken;
  pool: AaveV2PoolContract;
} & TokenBase;

export type WrappedAaveV2PoolTokenData = {
  symbol: WrappedAaveV2LPToken;
  type: TokenType.WRAPPED_AAVE_V2_TOKEN;
  underlying: AaveV2LPToken;
} & TokenBase;

export const aaveV2Tokens: Record<AaveV2LPToken, AaveV2PoolTokenData> = {
  aDAI: {
    name: "AaveV2 aDAI",
    symbol: "aDAI",
    type: TokenType.AAVE_V2_A_TOKEN,
    underlying: "DAI",
    pool: "AAVE_V2_DAI_POOL",
  },

  aUSDC: {
    name: "AaveV2 aUSDC",
    symbol: "aUSDC",
    type: TokenType.AAVE_V2_A_TOKEN,
    underlying: "USDC",
    pool: "AAVE_V2_USDC_POOL",
  },

  aUSDT: {
    name: "AaveV2 aUSDT",
    symbol: "aUSDT",
    type: TokenType.AAVE_V2_A_TOKEN,
    underlying: "USDT",
    pool: "AAVE_V2_USDT_POOL",
  },

  aWETH: {
    name: "AaveV2 aWETH",
    symbol: "aWETH",
    type: TokenType.AAVE_V2_A_TOKEN,
    underlying: "WETH",
    pool: "AAVE_V2_WETH_POOL",
  },
};

export const wrappedAaveV2Tokens: Record<
  WrappedAaveV2LPToken,
  WrappedAaveV2PoolTokenData
> = {
  waDAI: {
    name: "Wrapped AaveV2 aDAI",
    symbol: "waDAI",
    type: TokenType.WRAPPED_AAVE_V2_TOKEN,
    underlying: "aDAI",
  },

  waUSDC: {
    name: "Wrapped AaveV2 aUSDC",
    symbol: "waUSDC",
    type: TokenType.WRAPPED_AAVE_V2_TOKEN,
    underlying: "aUSDC",
  },

  waUSDT: {
    name: "Wrapped AaveV2 aUSDT",
    symbol: "waUSDT",
    type: TokenType.WRAPPED_AAVE_V2_TOKEN,
    underlying: "aUSDT",
  },

  waWETH: {
    name: "Wrapped AaveV2 aWETH",
    symbol: "waWETH",
    type: TokenType.WRAPPED_AAVE_V2_TOKEN,
    underlying: "aWETH",
  },
};

export const isAaveV2LPToken = (t: unknown): t is AaveV2LPToken =>
  typeof t === "string" && !!aaveV2Tokens[t as AaveV2LPToken];
