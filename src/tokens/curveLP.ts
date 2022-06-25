import {TradeAction, TradeType} from "../pathfinder/tradeTypes";
import {SupportedToken, TokenBase} from "./token";
import {PartialRecord} from "../utils/types";
import {BigNumber} from "ethers";
import {TokenType} from "./tokenType";

export type CurveLPToken =
    | "3Crv"
    | "steCRV"
    | "FRAX3CRV"
    | "LUSD3CRV"
    | "crvPlain3andSUSD"
    | "gusd3CRV";

export type CurveLPTokenData = {
    symbol: CurveLPToken;
    type: TokenType.CURVE_LP;
    swapActions?: Array<TradeAction>;
    lpActions: Array<TradeAction>;
} & TokenBase;

export type MetaCurveLPTokenData = {
    symbol: CurveLPToken;
    type: TokenType.META_CURVE_LP;
    lpActions: Array<TradeAction>;
} & TokenBase;

export const Curve3CrvUnderlyingTokenIndex: PartialRecord<SupportedToken,
    BigNumber> = {
    DAI: BigNumber.from(0),
    USDC: BigNumber.from(1),
    USDT: BigNumber.from(2)
};

export const curveTokens: Record<CurveLPToken, CurveLPTokenData | MetaCurveLPTokenData> = {
    // CURVE LP TOKENS
    "3Crv": {
        name: "3Crv",
        decimals: 18,

        symbol: "3Crv",
        type: TokenType.CURVE_LP,
        lpActions: [
            {
                type: TradeType.CurveWithdrawLP,
                contract: "CURVE_3CRV_POOL",
                tokenOut: ["DAI", "USDC", "USDT"]
            },
            {
                type: TradeType.ConvexDepositLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "cvx3Crv"
            },
            {
                type: TradeType.ConvexDepositLPAndStake,
                contract: "CONVEX_BOOSTER",
                tokenOut: "stkcvx3Crv"
            }
        ]
    },

    steCRV: {
        name: "steCRV",
        decimals: 18,

        symbol: "steCRV",
        type: TokenType.CURVE_LP,
        lpActions: [
            {
                type: TradeType.CurveWithdrawLP,
                contract: "CURVE_STETH_GATEWAY",
                tokenOut: ["STETH", "WETH"]
            },
            {
                type: TradeType.ConvexDepositLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "cvxsteCRV"
            },
            {
                type: TradeType.ConvexDepositLPAndStake,
                contract: "CONVEX_BOOSTER",
                tokenOut: "stkcvxsteCRV"
            }
        ]
    },

    crvPlain3andSUSD: {
        name: "crvPlain3andSUSD",
        decimals: 18,

        symbol: "crvPlain3andSUSD",
        type: TokenType.CURVE_LP,
        lpActions: [
            {
                type: TradeType.CurveWithdrawLP,
                contract: "CURVE_SUSD_POOL",
                tokenOut: ["DAI", "USDC", "USDT", "sUSD"]
            },
            {
                type: TradeType.ConvexDepositLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "cvxcrvPlain3andSUSD"
            },
            {
                type: TradeType.ConvexDepositLPAndStake,
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
        type: TokenType.META_CURVE_LP,
        lpActions: [
            {
                type: TradeType.CurveWithdrawLP,
                contract: "CURVE_FRAX_POOL",
                tokenOut: ["FRAX", "3Crv"]
            },
            {
                type: TradeType.ConvexDepositLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "cvxFRAX3CRV"
            },
            {
                type: TradeType.ConvexDepositLPAndStake,
                contract: "CONVEX_BOOSTER",
                tokenOut: "stkcvxFRAX3CRV"
            }
        ]
    },

    LUSD3CRV: {
        name: "LUSD3CRV-f",
        decimals: 18,

        symbol: "LUSD3CRV",
        type: TokenType.META_CURVE_LP,
        lpActions: [
            {
                type: TradeType.CurveWithdrawLP,
                contract: "CURVE_LUSD_POOL",
                tokenOut: ["LUSD", "3Crv"]
            }
        ]
    },

    gusd3CRV: {
        name: "gusd3CRV",
        decimals: 18,

        symbol: "gusd3CRV",
        type: TokenType.META_CURVE_LP,
        lpActions: [
            {
                type: TradeType.CurveWithdrawLP,
                contract: "CURVE_GUSD_POOL",
                tokenOut: ["GUSD", "3Crv"]
            },
            {
                type: TradeType.ConvexDepositLP,
                contract: "CONVEX_BOOSTER",
                tokenOut: "cvxgusd3CRV"
            },
            {
                type: TradeType.ConvexDepositLPAndStake,
                contract: "CONVEX_BOOSTER",
                tokenOut: "stkcvxgusd3CRV"
            }
        ]
    }
};
