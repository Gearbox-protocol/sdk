"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConvexStakedPhantomToken = exports.isConvexLPToken = exports.isConvexToken = exports.convexTokens = void 0;
var tradeTypes_1 = require("../pathfinder/tradeTypes");
var tokenType_1 = require("./tokenType");
var convexLpTokens = {
    cvx3Crv: {
        name: "Convex cvx3Crv",
        decimals: 18,
        symbol: "cvx3Crv",
        type: tokenType_1.TokenType.CONVEX_LP_TOKEN,
        pool: "CONVEX_3CRV_POOL",
        pid: 9,
        underlying: "3Crv",
        stakedToken: "stkcvx3Crv",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.ConvexWithdrawLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "3Crv"
            },
            {
                type: tradeTypes_1.TradeType.ConvexStake,
                contract: "CONVEX_3CRV_POOL",
                tokenOut: "stkcvx3Crv"
            }
        ]
    },
    cvxsteCRV: {
        name: "Convex cvxsteCRV",
        decimals: 18,
        symbol: "cvxsteCRV",
        type: tokenType_1.TokenType.CONVEX_LP_TOKEN,
        pool: "CONVEX_STECRV_POOL",
        pid: 25,
        underlying: "steCRV",
        stakedToken: "stkcvxsteCRV",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.ConvexWithdrawLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "steCRV"
            },
            {
                type: tradeTypes_1.TradeType.ConvexStake,
                contract: "CONVEX_STECRV_POOL",
                tokenOut: "stkcvxsteCRV"
            }
        ]
    },
    cvxFRAX3CRV: {
        name: "Convex cvxFRAX3CRV-f",
        decimals: 18,
        symbol: "cvxFRAX3CRV",
        type: tokenType_1.TokenType.CONVEX_LP_TOKEN,
        pool: "CONVEX_FRAX3CRV_POOL",
        pid: 32,
        underlying: "FRAX3CRV",
        stakedToken: "stkcvxFRAX3CRV",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.ConvexWithdrawLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "FRAX3CRV"
            },
            {
                type: tradeTypes_1.TradeType.ConvexStake,
                contract: "CONVEX_FRAX3CRV_POOL",
                tokenOut: "stkcvxFRAX3CRV"
            }
        ]
    },
    cvxLUSD3CRV: {
        name: "Convex cvxLUSD3CRV-f",
        decimals: 18,
        symbol: "cvxLUSD3CRV",
        type: tokenType_1.TokenType.CONVEX_LP_TOKEN,
        pool: "CONVEX_LUSD3CRV_POOL",
        pid: 33,
        underlying: "LUSD3CRV",
        stakedToken: "stkcvxLUSD3CRV",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.ConvexWithdrawLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "LUSD3CRV"
            },
            {
                type: tradeTypes_1.TradeType.ConvexStake,
                contract: "CONVEX_LUSD3CRV_POOL",
                tokenOut: "stkcvxLUSD3CRV"
            }
        ]
    },
    cvxcrvPlain3andSUSD: {
        name: "Convex cvxcrvPlain3andSUSD",
        decimals: 18,
        symbol: "cvxcrvPlain3andSUSD",
        type: tokenType_1.TokenType.CONVEX_LP_TOKEN,
        pool: "CONVEX_SUSD_POOL",
        pid: 4,
        underlying: "crvPlain3andSUSD",
        stakedToken: "stkcvxcrvPlain3andSUSD",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.ConvexWithdrawLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "crvPlain3andSUSD"
            },
            {
                type: tradeTypes_1.TradeType.ConvexStake,
                contract: "CONVEX_SUSD_POOL",
                tokenOut: "stkcvxcrvPlain3andSUSD"
            }
        ]
    },
    cvxgusd3CRV: {
        name: "Convex cvxgusd3CRV",
        decimals: 18,
        symbol: "cvxgusd3CRV",
        type: tokenType_1.TokenType.CONVEX_LP_TOKEN,
        pool: "CONVEX_GUSD_POOL",
        pid: 10,
        underlying: "gusd3CRV",
        stakedToken: "stkcvxgusd3CRV",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.ConvexWithdrawLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "gusd3CRV"
            },
            {
                type: tradeTypes_1.TradeType.ConvexStake,
                contract: "CONVEX_GUSD_POOL",
                tokenOut: "stkcvxgusd3CRV"
            }
        ]
    }
};
var convexStakedPhantomTokens = {
    stkcvx3Crv: {
        name: "Convex stkcvx3Crv",
        decimals: 18,
        symbol: "stkcvx3Crv",
        type: tokenType_1.TokenType.CONVEX_STAKED_PHANTOM_TOKEN,
        pool: "CONVEX_3CRV_POOL",
        pid: 9,
        underlying: "3Crv",
        lpToken: "cvx3Crv",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.ConvexWithdraw,
                contract: "CONVEX_3CRV_POOL",
                tokenOut: "cvx3Crv"
            },
            {
                type: tradeTypes_1.TradeType.ConvexWithdrawAndUnwrap,
                contract: "CONVEX_3CRV_POOL",
                tokenOut: "3Crv"
            }
        ]
    },
    stkcvxsteCRV: {
        name: "Convex stkcvxsteCRV",
        decimals: 18,
        symbol: "stkcvxsteCRV",
        type: tokenType_1.TokenType.CONVEX_STAKED_PHANTOM_TOKEN,
        pool: "CONVEX_STECRV_POOL",
        pid: 25,
        underlying: "steCRV",
        lpToken: "cvxsteCRV",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.ConvexWithdraw,
                contract: "CONVEX_STECRV_POOL",
                tokenOut: "cvxsteCRV"
            },
            {
                type: tradeTypes_1.TradeType.ConvexWithdrawAndUnwrap,
                contract: "CONVEX_STECRV_POOL",
                tokenOut: "steCRV"
            }
        ]
    },
    stkcvxFRAX3CRV: {
        name: "Convex stkcvxFRAX3CRV-f",
        decimals: 18,
        symbol: "stkcvxFRAX3CRV",
        type: tokenType_1.TokenType.CONVEX_STAKED_PHANTOM_TOKEN,
        pool: "CONVEX_FRAX3CRV_POOL",
        pid: 32,
        underlying: "FRAX3CRV",
        lpToken: "cvxFRAX3CRV",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.ConvexWithdraw,
                contract: "CONVEX_FRAX3CRV_POOL",
                tokenOut: "cvxFRAX3CRV"
            },
            {
                type: tradeTypes_1.TradeType.ConvexWithdrawAndUnwrap,
                contract: "CONVEX_FRAX3CRV_POOL",
                tokenOut: "FRAX3CRV"
            }
        ]
    },
    stkcvxLUSD3CRV: {
        name: "Convex stkcvxLUSD3CRV-f",
        decimals: 18,
        symbol: "stkcvxLUSD3CRV",
        type: tokenType_1.TokenType.CONVEX_STAKED_PHANTOM_TOKEN,
        pool: "CONVEX_LUSD3CRV_POOL",
        pid: 32,
        underlying: "LUSD3CRV",
        lpToken: "cvxLUSD3CRV",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.ConvexWithdraw,
                contract: "CONVEX_LUSD3CRV_POOL",
                tokenOut: "cvxLUSD3CRV"
            },
            {
                type: tradeTypes_1.TradeType.ConvexWithdrawAndUnwrap,
                contract: "CONVEX_LUSD3CRV_POOL",
                tokenOut: "LUSD3CRV"
            }
        ]
    },
    stkcvxcrvPlain3andSUSD: {
        name: "Convex stkcvxcrvPlain3andSUSD",
        decimals: 18,
        symbol: "stkcvxcrvPlain3andSUSD",
        type: tokenType_1.TokenType.CONVEX_STAKED_PHANTOM_TOKEN,
        pool: "CONVEX_SUSD_POOL",
        pid: 4,
        underlying: "crvPlain3andSUSD",
        lpToken: "cvxcrvPlain3andSUSD",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.ConvexWithdraw,
                contract: "CONVEX_SUSD_POOL",
                tokenOut: "cvxcrvPlain3andSUSD"
            },
            {
                type: tradeTypes_1.TradeType.ConvexWithdrawAndUnwrap,
                contract: "CONVEX_SUSD_POOL",
                tokenOut: "crvPlain3andSUSD"
            }
        ]
    },
    stkcvxgusd3CRV: {
        name: "Convex stkcvxgusd3CRV",
        decimals: 18,
        symbol: "stkcvxgusd3CRV",
        type: tokenType_1.TokenType.CONVEX_STAKED_PHANTOM_TOKEN,
        pool: "CONVEX_GUSD_POOL",
        pid: 10,
        underlying: "gusd3CRV",
        lpToken: "cvxgusd3CRV",
        lpActions: [
            {
                type: tradeTypes_1.TradeType.ConvexWithdraw,
                contract: "CONVEX_GUSD_POOL",
                tokenOut: "cvxgusd3CRV"
            },
            {
                type: tradeTypes_1.TradeType.ConvexWithdrawAndUnwrap,
                contract: "CONVEX_GUSD_POOL",
                tokenOut: "gusd3CRV"
            }
        ]
    }
};
exports.convexTokens = __assign(__assign({}, convexLpTokens), convexStakedPhantomTokens);
var isConvexToken = function (t) {
    return typeof t === "string" &&
        !!exports.convexTokens[t];
};
exports.isConvexToken = isConvexToken;
var isConvexLPToken = function (t) {
    return typeof t === "string" && !!convexLpTokens[t];
};
exports.isConvexLPToken = isConvexLPToken;
var isConvexStakedPhantomToken = function (t) {
    return typeof t === "string" &&
        !!convexStakedPhantomTokens[t];
};
exports.isConvexStakedPhantomToken = isConvexStakedPhantomToken;
