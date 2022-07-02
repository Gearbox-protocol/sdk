"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalTokens = void 0;
var tradeTypes_1 = require("../pathfinder/tradeTypes");
var tokenType_1 = require("./tokenType");
exports.normalTokens = {
    "1INCH": {
        name: "1INCH",
        decimals: 18,
        symbol: "1INCH",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    AAVE: {
        name: "AAVE",
        decimals: 18,
        symbol: "AAVE",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    COMP: {
        name: "COMP",
        decimals: 18,
        symbol: "COMP",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    CRV: {
        name: "CRV",
        decimals: 18,
        symbol: "CRV",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    DAI: {
        name: "DAI",
        decimals: 18,
        symbol: "DAI",
        type: tokenType_1.TokenType.CONNECTOR,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.CurveExchange,
                contract: "CURVE_3CRV_POOL",
                tokenOut: ["USDC", "USDT"]
            },
            {
                type: tradeTypes_1.TradeType.CurveExchange,
                contract: "CURVE_SUSD_POOL",
                tokenOut: ["USDC", "USDT", "sUSD"]
            }
        ],
        lpActions: [
            {
                type: tradeTypes_1.TradeType.CurveDepositLP,
                contract: "CURVE_3CRV_POOL",
                tokenOut: "3Crv"
            },
            {
                type: tradeTypes_1.TradeType.CurveDepositLP,
                contract: "CURVE_SUSD_POOL",
                tokenOut: "crvPlain3andSUSD"
            },
            {
                type: tradeTypes_1.TradeType.YearnDeposit,
                contract: "YEARN_DAI_VAULT",
                tokenOut: "yvDAI"
            }
        ]
    },
    DPI: {
        name: "DPI",
        decimals: 18,
        symbol: "DPI",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    FEI: {
        name: "FEI",
        decimals: 18,
        symbol: "FEI",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    LINK: {
        name: "LINK",
        decimals: 18,
        symbol: "LINK",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    SNX: {
        name: "SNX",
        decimals: 18,
        symbol: "SNX",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    SUSHI: {
        name: "SUSHI",
        decimals: 18,
        symbol: "SUSHI",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    UNI: {
        name: "UNI",
        decimals: 18,
        symbol: "UNI",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            }
        ]
    },
    USDC: {
        name: "USDC",
        decimals: 6,
        symbol: "USDC",
        type: tokenType_1.TokenType.CONNECTOR,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.CurveExchange,
                contract: "CURVE_3CRV_POOL",
                tokenOut: ["DAI", "USDT"]
            },
            {
                type: tradeTypes_1.TradeType.CurveExchange,
                contract: "CURVE_SUSD_POOL",
                tokenOut: ["DAI", "USDT", "sUSD"]
            }
        ],
        lpActions: [
            {
                type: tradeTypes_1.TradeType.CurveDepositLP,
                contract: "CURVE_3CRV_POOL",
                tokenOut: "3Crv"
            },
            {
                type: tradeTypes_1.TradeType.CurveDepositLP,
                contract: "CURVE_SUSD_POOL",
                tokenOut: "crvPlain3andSUSD"
            },
            {
                type: tradeTypes_1.TradeType.YearnDeposit,
                contract: "YEARN_USDC_VAULT",
                tokenOut: "yvUSDC"
            }
        ]
    },
    USDT: {
        name: "USDT",
        decimals: 6,
        symbol: "USDT",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.CurveExchange,
                contract: "CURVE_3CRV_POOL",
                tokenOut: ["USDC", "DAI"]
            },
            {
                type: tradeTypes_1.TradeType.CurveExchange,
                contract: "CURVE_SUSD_POOL",
                tokenOut: ["DAI", "USDC", "sUSD"]
            }
        ],
        lpActions: [
            {
                type: tradeTypes_1.TradeType.CurveDepositLP,
                contract: "CURVE_3CRV_POOL",
                tokenOut: "3Crv"
            },
            {
                type: tradeTypes_1.TradeType.CurveDepositLP,
                contract: "CURVE_SUSD_POOL",
                tokenOut: "crvPlain3andSUSD"
            }
        ]
    },
    WBTC: {
        name: "WBTC",
        decimals: 8,
        symbol: "WBTC",
        type: tokenType_1.TokenType.CONNECTOR,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ],
        lpActions: [
            {
                type: tradeTypes_1.TradeType.YearnDeposit,
                contract: "YEARN_WBTC_VAULT",
                tokenOut: "yvWBTC"
            }
        ]
    },
    WETH: {
        name: "WETH",
        decimals: 18,
        symbol: "WETH",
        type: tokenType_1.TokenType.CONNECTOR,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.CurveExchange,
                contract: "CURVE_STETH_GATEWAY",
                tokenOut: ["STETH"]
            }
        ],
        lpActions: [
            {
                type: tradeTypes_1.TradeType.YearnDeposit,
                contract: "YEARN_WETH_VAULT",
                tokenOut: "yvWETH"
            },
            {
                type: tradeTypes_1.TradeType.CurveDepositLP,
                contract: "CURVE_STETH_GATEWAY",
                tokenOut: "steCRV"
            }
        ]
    },
    YFI: {
        name: "YFI",
        decimals: 18,
        symbol: "YFI",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    /// UPDATE
    STETH: {
        name: "stETH",
        decimals: 18,
        symbol: "STETH",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.CurveExchange,
                contract: "CURVE_STETH_GATEWAY",
                tokenOut: ["WETH"]
            }
        ],
        lpActions: [
            {
                type: tradeTypes_1.TradeType.CurveDepositLP,
                contract: "CURVE_STETH_GATEWAY",
                tokenOut: "steCRV"
            }
        ]
    },
    FTM: {
        name: "FTM",
        decimals: 18,
        symbol: "FTM",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    CVX: {
        name: "CVX",
        decimals: 18,
        symbol: "CVX",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    FRAX: {
        name: "FRAX",
        decimals: 18,
        symbol: "FRAX",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.CurveExchange,
                contract: "CURVE_FRAX_POOL",
                tokenOut: ["3Crv"]
            }
        ],
        lpActions: [
            {
                type: tradeTypes_1.TradeType.CurveDepositLP,
                contract: "CURVE_FRAX_POOL",
                tokenOut: "FRAX3CRV"
            }
        ]
    },
    FXS: {
        name: "FXS",
        decimals: 18,
        symbol: "FXS",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    LDO: {
        name: "LDO",
        decimals: 18,
        symbol: "LDO",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    SPELL: {
        name: "SPELL",
        decimals: 18,
        symbol: "SPELL",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    LUSD: {
        name: "LUSD",
        decimals: 18,
        symbol: "LUSD",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.CurveExchange,
                contract: "CURVE_LUSD_POOL",
                tokenOut: ["3Crv"]
            }
        ],
        lpActions: [
            {
                type: tradeTypes_1.TradeType.CurveDepositLP,
                contract: "CURVE_LUSD_POOL",
                tokenOut: "LUSD3CRV"
            }
        ]
    },
    sUSD: {
        name: "sUSD",
        decimals: 18,
        symbol: "sUSD",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.CurveExchange,
                contract: "CURVE_SUSD_POOL",
                tokenOut: ["DAI", "USDT", "USDC"]
            }
        ],
        lpActions: [
            {
                type: tradeTypes_1.TradeType.CurveDepositLP,
                contract: "CURVE_SUSD_POOL",
                tokenOut: "crvPlain3andSUSD"
            }
        ]
    },
    GUSD: {
        name: "GUSD",
        decimals: 18,
        symbol: "GUSD",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.CurveExchange,
                contract: "CURVE_GUSD_POOL",
                tokenOut: ["3Crv"]
            }
        ],
        lpActions: [
            {
                type: tradeTypes_1.TradeType.CurveDepositLP,
                contract: "CURVE_GUSD_POOL",
                tokenOut: "gusd3CRV"
            }
        ]
    },
    LUNA: {
        name: "LUNA",
        decimals: 18,
        symbol: "LUNA",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    },
    LQTY: {
        name: "LQTY",
        decimals: 18,
        symbol: "LQTY",
        type: tokenType_1.TokenType.NORMAL_TOKEN,
        swapActions: [
            {
                type: tradeTypes_1.TradeType.UniswapV3Swap,
                contract: "UNISWAP_V3_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "UNISWAP_V2_ROUTER"
            },
            {
                type: tradeTypes_1.TradeType.UniswapV2Swap,
                contract: "SUSHISWAP_ROUTER"
            }
        ]
    }
};
