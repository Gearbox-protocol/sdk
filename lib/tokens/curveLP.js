"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.curveTokens = exports.Curve3CrvUnderlyingTokenIndex = void 0;
var ethers_1 = require("ethers");
var tradeTypes_1 = require("../pathfinder/tradeTypes");
var tokenType_1 = require("./tokenType");
exports.Curve3CrvUnderlyingTokenIndex = {
    DAI: ethers_1.BigNumber.from(0),
    USDC: ethers_1.BigNumber.from(1),
    USDT: ethers_1.BigNumber.from(2)
};
exports.curveTokens = {
    // CURVE LP TOKENS
    "3Crv": {
        name: "3Crv",
        decimals: 18,
        symbol: "3Crv",
        type: tokenType_1.TokenType.CURVE_LP,
        pool: "CURVE_3CRV_POOL",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.CurveWithdrawLP,
                contract: "CURVE_3CRV_POOL",
                tokenOut: ["DAI", "USDC", "USDT"]
            },
            {
                type: tradeTypes_1.TradeType.ConvexDepositLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "cvx3Crv"
            },
            {
                type: tradeTypes_1.TradeType.ConvexDepositLPAndStake,
                contract: "CONVEX_BOOSTER",
                tokenOut: "stkcvx3Crv"
            }
        ]
    },
    steCRV: {
        name: "steCRV",
        decimals: 18,
        symbol: "steCRV",
        type: tokenType_1.TokenType.CURVE_LP,
        pool: "CURVE_STETH_GATEWAY",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.CurveWithdrawLP,
                contract: "CURVE_STETH_GATEWAY",
                tokenOut: ["STETH", "WETH"]
            },
            {
                type: tradeTypes_1.TradeType.ConvexDepositLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "cvxsteCRV"
            },
            {
                type: tradeTypes_1.TradeType.ConvexDepositLPAndStake,
                contract: "CONVEX_BOOSTER",
                tokenOut: "stkcvxsteCRV"
            }
        ]
    },
    crvPlain3andSUSD: {
        name: "crvPlain3andSUSD",
        decimals: 18,
        symbol: "crvPlain3andSUSD",
        type: tokenType_1.TokenType.CURVE_LP,
        pool: "CURVE_SUSD_POOL",
        wrapper: "CURVE_SUSD_DEPOSIT",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.CurveWithdrawLP,
                contract: "CURVE_SUSD_POOL",
                tokenOut: ["DAI", "USDC", "USDT", "sUSD"]
            },
            {
                type: tradeTypes_1.TradeType.ConvexDepositLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "cvxcrvPlain3andSUSD"
            },
            {
                type: tradeTypes_1.TradeType.ConvexDepositLPAndStake,
                contract: "CONVEX_BOOSTER",
                tokenOut: "stkcvxcrvPlain3andSUSD"
            }
        ]
    },
    //  META CURVE LP TOKENS
    FRAX3CRV: {
        name: "FRAX3CRV-f",
        decimals: 18,
        symbol: "FRAX3CRV",
        type: tokenType_1.TokenType.META_CURVE_LP,
        pool: "CURVE_FRAX_POOL",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.CurveWithdrawLP,
                contract: "CURVE_FRAX_POOL",
                tokenOut: ["FRAX", "3Crv"]
            },
            {
                type: tradeTypes_1.TradeType.ConvexDepositLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "cvxFRAX3CRV"
            },
            {
                type: tradeTypes_1.TradeType.ConvexDepositLPAndStake,
                contract: "CONVEX_BOOSTER",
                tokenOut: "stkcvxFRAX3CRV"
            }
        ]
    },
    LUSD3CRV: {
        name: "LUSD3CRV-f",
        decimals: 18,
        symbol: "LUSD3CRV",
        type: tokenType_1.TokenType.META_CURVE_LP,
        pool: "CURVE_LUSD_POOL",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.CurveWithdrawLP,
                contract: "CURVE_LUSD_POOL",
                tokenOut: ["LUSD", "3Crv"]
            }
        ]
    },
    gusd3CRV: {
        name: "gusd3CRV",
        decimals: 18,
        symbol: "gusd3CRV",
        type: tokenType_1.TokenType.META_CURVE_LP,
        pool: "CURVE_GUSD_POOL",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.CurveWithdrawLP,
                contract: "CURVE_GUSD_POOL",
                tokenOut: ["GUSD", "3Crv"]
            },
            {
                type: tradeTypes_1.TradeType.ConvexDepositLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "cvxgusd3CRV"
            },
            {
                type: tradeTypes_1.TradeType.ConvexDepositLPAndStake,
                contract: "CONVEX_BOOSTER",
                tokenOut: "stkcvxgusd3CRV"
            }
        ]
    }
};
