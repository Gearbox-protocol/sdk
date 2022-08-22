import { TradeAction, TradeType } from "../pathfinder/tradeTypes";
import type { TokenBase } from "./token";
import { TokenType } from "./tokenType";

export type NormalToken =
  | "1INCH"
  | "AAVE"
  | "COMP"
  | "CRV"
  | "DPI"
  | "FEI"
  | "LINK"
  | "SNX"
  | "SUSHI"
  | "UNI"
  | "USDT"
  | "USDC"
  | "DAI"
  | "WETH"
  | "WBTC"
  | "YFI"

  // NEW TOKENS
  | "STETH"
  | "FTM"
  | "CVX"
  | "FRAX"
  | "FXS"
  | "LDO"
  | "SPELL"
  | "LUSD"
  | "sUSD"
  | "GUSD"
  | "LUNA"
  | "LQTY";

export type NormalTokenData = {
  symbol: NormalToken;
  type: TokenType.CONNECTOR | TokenType.NORMAL_TOKEN;
  swapActions: Array<TradeAction>;
  lpActions?: Array<TradeAction>;
} & TokenBase;

export const normalTokens: Record<NormalToken, NormalTokenData> = {
  "1INCH": {
    name: "1INCH",
    decimals: 18,

    symbol: "1INCH",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  AAVE: {
    name: "AAVE",
    decimals: 18,

    symbol: "AAVE",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  COMP: {
    name: "COMP",
    decimals: 18,

    symbol: "COMP",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  CRV: {
    name: "CRV",
    decimals: 18,

    symbol: "CRV",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  DAI: {
    name: "DAI",
    decimals: 18,

    symbol: "DAI",
    type: TokenType.CONNECTOR,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
      {
        type: TradeType.CurveExchange,
        contract: "CURVE_3CRV_POOL",
        tokenOut: ["USDC", "USDT"],
      },
      {
        type: TradeType.CurveExchange,
        contract: "CURVE_SUSD_POOL",
        tokenOut: ["USDC", "USDT", "sUSD"],
      },
    ],
    lpActions: [
      {
        type: TradeType.CurveDepositLP,
        contract: "CURVE_3CRV_POOL",
        tokenOut: "3Crv",
      },
      {
        type: TradeType.CurveDepositLP,
        contract: "CURVE_SUSD_POOL",
        tokenOut: "crvPlain3andSUSD",
      },
      {
        type: TradeType.YearnDeposit,
        contract: "YEARN_DAI_VAULT",
        tokenOut: "yvDAI",
      },
    ],
  },

  DPI: {
    name: "DPI",
    decimals: 18,

    symbol: "DPI",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  FEI: {
    name: "FEI",
    decimals: 18,

    symbol: "FEI",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  LINK: {
    name: "LINK",
    decimals: 18,

    symbol: "LINK",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  SNX: {
    name: "SNX",
    decimals: 18,

    symbol: "SNX",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  SUSHI: {
    name: "SUSHI",
    decimals: 18,

    symbol: "SUSHI",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  UNI: {
    name: "UNI",
    decimals: 18,

    symbol: "UNI",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
    ],
  },

  USDC: {
    name: "USDC",
    decimals: 6,

    symbol: "USDC",
    type: TokenType.CONNECTOR,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
      {
        type: TradeType.CurveExchange,
        contract: "CURVE_3CRV_POOL",
        tokenOut: ["DAI", "USDT"],
      },
      {
        type: TradeType.CurveExchange,
        contract: "CURVE_SUSD_POOL",
        tokenOut: ["DAI", "USDT", "sUSD"],
      },
    ],
    lpActions: [
      {
        type: TradeType.CurveDepositLP,
        contract: "CURVE_3CRV_POOL",
        tokenOut: "3Crv",
      },
      {
        type: TradeType.CurveDepositLP,
        contract: "CURVE_SUSD_POOL",
        tokenOut: "crvPlain3andSUSD",
      },
      {
        type: TradeType.YearnDeposit,
        contract: "YEARN_USDC_VAULT",
        tokenOut: "yvUSDC",
      },
    ],
  },

  USDT: {
    name: "USDT",
    decimals: 6,

    symbol: "USDT",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
      {
        type: TradeType.CurveExchange,
        contract: "CURVE_3CRV_POOL",
        tokenOut: ["USDC", "DAI"],
      },
      {
        type: TradeType.CurveExchange,
        contract: "CURVE_SUSD_POOL",
        tokenOut: ["DAI", "USDC", "sUSD"],
      },
    ],
    lpActions: [
      {
        type: TradeType.CurveDepositLP,
        contract: "CURVE_3CRV_POOL",
        tokenOut: "3Crv",
      },
      {
        type: TradeType.CurveDepositLP,
        contract: "CURVE_SUSD_POOL",
        tokenOut: "crvPlain3andSUSD",
      },
    ],
  },

  WBTC: {
    name: "WBTC",
    decimals: 8,

    symbol: "WBTC",
    type: TokenType.CONNECTOR,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
    lpActions: [
      {
        type: TradeType.YearnDeposit,
        contract: "YEARN_WBTC_VAULT",
        tokenOut: "yvWBTC",
      },
    ],
  },

  WETH: {
    name: "WETH",
    decimals: 18,

    symbol: "WETH",
    type: TokenType.CONNECTOR,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
      {
        type: TradeType.CurveExchange,
        contract: "CURVE_STETH_GATEWAY",
        tokenOut: ["STETH"],
      },
    ],
    lpActions: [
      {
        type: TradeType.YearnDeposit,
        contract: "YEARN_WETH_VAULT",
        tokenOut: "yvWETH",
      },
      {
        type: TradeType.CurveDepositLP,
        contract: "CURVE_STETH_GATEWAY",
        tokenOut: "steCRV",
      },
    ],
  },

  YFI: {
    name: "YFI",
    decimals: 18,

    symbol: "YFI",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  /// UPDATE
  STETH: {
    name: "stETH",
    decimals: 18,

    symbol: "STETH",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
      {
        type: TradeType.CurveExchange,
        contract: "CURVE_STETH_GATEWAY",
        tokenOut: ["WETH"],
      },
    ],
    lpActions: [
      {
        type: TradeType.CurveDepositLP,
        contract: "CURVE_STETH_GATEWAY",
        tokenOut: "steCRV",
      },
    ],
  },

  FTM: {
    name: "FTM",
    decimals: 18,

    symbol: "FTM",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  CVX: {
    name: "CVX",
    decimals: 18,

    symbol: "CVX",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  FRAX: {
    name: "FRAX",
    decimals: 18,

    symbol: "FRAX",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
      {
        type: TradeType.CurveExchange,
        contract: "CURVE_FRAX_POOL",
        tokenOut: ["3Crv"],
      },
    ],
    lpActions: [
      {
        type: TradeType.CurveDepositLP,
        contract: "CURVE_FRAX_POOL",
        tokenOut: "FRAX3CRV",
      },
    ],
  },

  FXS: {
    name: "FXS",
    decimals: 18,

    symbol: "FXS",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  LDO: {
    name: "LDO",
    decimals: 18,

    symbol: "LDO",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  SPELL: {
    name: "SPELL",
    decimals: 18,

    symbol: "SPELL",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  LUSD: {
    name: "LUSD",
    decimals: 18,

    symbol: "LUSD",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
      {
        type: TradeType.CurveExchange,
        contract: "CURVE_LUSD_POOL",
        tokenOut: ["3Crv"],
      },
    ],
    lpActions: [
      {
        type: TradeType.CurveDepositLP,
        contract: "CURVE_LUSD_POOL",
        tokenOut: "LUSD3CRV",
      },
    ],
  },

  sUSD: {
    name: "sUSD",
    decimals: 18,

    symbol: "sUSD",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
      {
        type: TradeType.CurveExchange,
        contract: "CURVE_SUSD_POOL",
        tokenOut: ["DAI", "USDT", "USDC"],
      },
    ],
    lpActions: [
      {
        type: TradeType.CurveDepositLP,
        contract: "CURVE_SUSD_POOL",
        tokenOut: "crvPlain3andSUSD",
      },
    ],
  },

  GUSD: {
    name: "GUSD",
    decimals: 18,

    symbol: "GUSD",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
      {
        type: TradeType.CurveExchange,
        contract: "CURVE_GUSD_POOL",
        tokenOut: ["3Crv"],
      },
    ],
    lpActions: [
      {
        type: TradeType.CurveDepositLP,
        contract: "CURVE_GUSD_POOL",
        tokenOut: "gusd3CRV",
      },
    ],
  },

  LUNA: {
    name: "LUNA",
    decimals: 18,

    symbol: "LUNA",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },

  LQTY: {
    name: "LQTY",
    decimals: 18,

    symbol: "LQTY",
    type: TokenType.NORMAL_TOKEN,
    swapActions: [
      {
        type: TradeType.UniswapV3Swap,
        contract: "UNISWAP_V3_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "UNISWAP_V2_ROUTER",
      },
      {
        type: TradeType.UniswapV2Swap,
        contract: "SUSHISWAP_ROUTER",
      },
    ],
  },
};

export const isNormalToken = (t: unknown): t is NormalToken =>
  typeof t === "string" && !!normalTokens[t as NormalToken];
