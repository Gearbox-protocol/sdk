"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yearnTokens = void 0;
var tradeTypes_1 = require("../core/tradeTypes");
var token_1 = require("./token");
exports.yearnTokens = {
    // YEARN TOKENS
    yvDAI: {
        name: "yvDAI",
        decimals: 18,
        symbol: "yvDAI",
        type: token_1.TokenType.YEARN_VAULT,
        underlying: "DAI",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.YearnWithdraw,
                contract: "YEARN_DAI_VAULT",
                tokenOut: "DAI"
            }
        ]
    },
    yvUSDC: {
        name: "yvUSDC",
        decimals: 6,
        symbol: "yvUSDC",
        type: token_1.TokenType.YEARN_VAULT,
        underlying: "USDC",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.YearnWithdraw,
                contract: "YEARN_USDC_VAULT",
                tokenOut: "USDC"
            }
        ]
    },
    yvWETH: {
        name: "yvWETH",
        decimals: 18,
        symbol: "yvWETH",
        type: token_1.TokenType.YEARN_VAULT,
        underlying: "WETH",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.YearnWithdraw,
                contract: "YEARN_WETH_VAULT",
                tokenOut: "WETH"
            }
        ]
    },
    yvWBTC: {
        name: "yvWBTC",
        decimals: 8,
        symbol: "yvWBTC",
        type: token_1.TokenType.YEARN_VAULT,
        underlying: "WBTC",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.YearnWithdraw,
                contract: "YEARN_WBTC_VAULT",
                tokenOut: "WBTC"
            }
        ]
    },
    // YEARN- CURVE TOKENS
    yvCurve_stETH: {
        name: "yvCurve-stETH",
        decimals: 18,
        symbol: "yvCurve_stETH",
        type: token_1.TokenType.YEARN_VAULT_OF_CURVE_LP,
        underlying: "steCRV",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.YearnWithdraw,
                contract: "YEARN_CURVE_STETH_VAULT",
                tokenOut: "steCRV"
            }
        ]
    },
    yvCURVE_FRAX_POOL: {
        name: "yvCurve-FRAX",
        decimals: 18,
        symbol: "yvCURVE_FRAX_POOL",
        type: token_1.TokenType.YEARN_VAULT_OF_META_CURVE_LP,
        underlying: "FRAX3CRV",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.YearnWithdraw,
                contract: "YEARN_CURVE_FRAX_VAULT",
                tokenOut: "FRAX3CRV"
            }
        ]
    }
};
