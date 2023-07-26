import { TradeAction, TradeType } from "../pathfinder/tradeTypes";
import { NormalToken } from "./normal";
import type { TokenBase } from "./token";
import { TokenType } from "./tokenType";

export type CompoundV2LPToken = "cDAI" | "cUSDC" | "cWETH" | "cUSDT";

export type CompoundV2PoolTokenData = {
  symbol: CompoundV2LPToken;
  type: TokenType.COMPOUND_V2_C_TOKEN;
  underlying: NormalToken;
  lpActions: Array<TradeAction>;
} & TokenBase;

export const compoundV2Tokens: Record<
  CompoundV2LPToken,
  CompoundV2PoolTokenData
> = {
  cDAI: {
    name: "CompoundV2 cDAI",
    symbol: "cDAI",
    type: TokenType.COMPOUND_V2_C_TOKEN,
    underlying: "DAI",

    lpActions: [
      {
        type: TradeType.CompoundV2Withdraw,
        contract: "COMPOUND_V2_DAI_POOL",
        tokenOut: "DAI",
      },
    ],
  },

  cUSDC: {
    name: "CompoundV2 cUSDC",
    symbol: "cUSDC",
    type: TokenType.COMPOUND_V2_C_TOKEN,
    underlying: "USDC",

    lpActions: [
      {
        type: TradeType.CompoundV2Withdraw,
        contract: "COMPOUND_V2_USDC_POOL",
        tokenOut: "USDC",
      },
    ],
  },

  cUSDT: {
    name: "CompoundV2 cUSDT",
    symbol: "cUSDT",
    type: TokenType.COMPOUND_V2_C_TOKEN,
    underlying: "USDT",

    lpActions: [
      {
        type: TradeType.CompoundV2Withdraw,
        contract: "COMPOUND_V2_USDT_POOL",
        tokenOut: "USDT",
      },
    ],
  },

  cWETH: {
    name: "CompoundV2 cWETH",
    symbol: "cWETH",
    type: TokenType.COMPOUND_V2_C_TOKEN,
    underlying: "WETH",

    lpActions: [
      {
        type: TradeType.CompoundV2Withdraw,
        contract: "COMPOUND_V2_WETH_POOL",
        tokenOut: "WETH",
      },
    ],
  },
};

export const isCompoundV2LPToken = (t: unknown): t is CompoundV2LPToken =>
  typeof t === "string" && !!compoundV2Tokens[t as CompoundV2LPToken];
