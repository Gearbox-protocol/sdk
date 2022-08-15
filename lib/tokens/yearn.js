"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isYearnLPToken = exports.yearnTokens = void 0;
var tradeTypes_1 = require("../pathfinder/tradeTypes");
var tokenType_1 = require("./tokenType");
exports.yearnTokens = {
    // YEARN TOKENS
    yvDAI: {
        name: "Yearn yvDAI",
        decimals: 18,
        symbol: "yvDAI",
        type: tokenType_1.TokenType.YEARN_VAULT,
        underlying: "DAI",
        vault: "YEARN_DAI_VAULT",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.YearnWithdraw,
                contract: "YEARN_DAI_VAULT",
                tokenOut: "DAI"
            }
        ]
    },
    yvUSDC: {
        name: "Yearn yvUSDC",
        decimals: 6,
        symbol: "yvUSDC",
        type: tokenType_1.TokenType.YEARN_VAULT,
        underlying: "USDC",
        vault: "YEARN_USDC_VAULT",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.YearnWithdraw,
                contract: "YEARN_USDC_VAULT",
                tokenOut: "USDC"
            }
        ]
    },
    yvWETH: {
        name: "Yearn yvWETH",
        decimals: 18,
        symbol: "yvWETH",
        type: tokenType_1.TokenType.YEARN_VAULT,
        underlying: "WETH",
        vault: "YEARN_WETH_VAULT",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.YearnWithdraw,
                contract: "YEARN_WETH_VAULT",
                tokenOut: "WETH"
            }
        ]
    },
    yvWBTC: {
        name: "Yearn yvWBTC",
        decimals: 8,
        symbol: "yvWBTC",
        type: tokenType_1.TokenType.YEARN_VAULT,
        underlying: "WBTC",
        vault: "YEARN_WBTC_VAULT",
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
        name: "Yearn yvCurve-stETH",
        decimals: 18,
        symbol: "yvCurve_stETH",
        type: tokenType_1.TokenType.YEARN_VAULT_OF_CURVE_LP,
        underlying: "steCRV",
        vault: "YEARN_CURVE_STETH_VAULT",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.YearnWithdraw,
                contract: "YEARN_CURVE_STETH_VAULT",
                tokenOut: "steCRV"
            }
        ]
    },
    yvCurve_FRAX: {
        name: "Yearn yvCurve-FRAX",
        decimals: 18,
        symbol: "yvCurve_FRAX",
        type: tokenType_1.TokenType.YEARN_VAULT_OF_META_CURVE_LP,
        underlying: "FRAX3CRV",
        vault: "YEARN_CURVE_FRAX_VAULT",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.YearnWithdraw,
                contract: "YEARN_CURVE_FRAX_VAULT",
                tokenOut: "FRAX3CRV"
            }
        ]
    }
};
var isYearnLPToken = function (t) {
    return typeof t === "string" && !!exports.yearnTokens[t];
};
exports.isYearnLPToken = isYearnLPToken;
