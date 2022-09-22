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
  | "UNI"
  | "USDT"
  | "USDC"
  | "DAI"
  | "WETH"
  | "WBTC"
  | "YFI"

  // NEW TOKENS
  | "STETH"
  | "wstETH"
  | "CVX"
  | "FRAX"
  | "FXS"
  | "LDO"
  | "LUSD"
  | "sUSD"
  | "GUSD"
  | "LQTY";

export type NormalTokenData = {
  symbol: NormalToken;
  type: TokenType.NORMAL_TOKEN;
  swapActions: Array<TradeAction>;
  lpActions?: Array<TradeAction>;
} & TokenBase;

export const normalTokens: Record<NormalToken, NormalTokenData> = {
  "1INCH": {
    name: "1INCH",

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

    symbol: "DAI",
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

  UNI: {
    name: "UNI",

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

    symbol: "USDC",
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

    symbol: "WBTC",
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

    symbol: "WETH",
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

  wstETH: {
    name: "wstETH",

    symbol: "wstETH",
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
  },

  CVX: {
    name: "CVX",

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

  LUSD: {
    name: "LUSD",

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

  LQTY: {
    name: "LQTY",

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
