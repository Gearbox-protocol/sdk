import { TradeAction } from "../pathfinder/tradeTypes";
import type { TokenBase } from "./token";
import type { ConvexPoolContract } from "../contracts/contracts";
import type { CurveLPToken } from "./curveLP";
import { TokenType } from "./tokenType";
export declare type ConvexLPToken = "cvx3Crv" | "cvxsteCRV" | "cvxFRAX3CRV" | "cvxLUSD3CRV" | "cvxcrvPlain3andSUSD" | "cvxgusd3CRV";
export declare type ConvexStakedPhantomToken = "stkcvx3Crv" | "stkcvxsteCRV" | "stkcvxFRAX3CRV" | "stkcvxLUSD3CRV" | "stkcvxcrvPlain3andSUSD" | "stkcvxgusd3CRV";
declare type BaseConvexToken = {
    pool: ConvexPoolContract;
    pid: number;
    underlying: CurveLPToken;
    lpActions: Array<TradeAction>;
} & TokenBase;
export declare type ConvexLPTokenData = {
    symbol: ConvexLPToken;
    type: TokenType.CONVEX_LP_TOKEN;
    stakedToken: ConvexStakedPhantomToken;
} & BaseConvexToken;
export declare type ConvexPhantomTokenData = {
    symbol: ConvexStakedPhantomToken;
    type: TokenType.CONVEX_STAKED_PHANTOM_TOKEN;
    lpToken: ConvexLPToken;
} & BaseConvexToken;
export declare const convexTokens: Record<ConvexLPToken | ConvexStakedPhantomToken, ConvexLPTokenData | ConvexPhantomTokenData>;
export declare const isConvexLPToken: (t: unknown) => t is ConvexLPToken;
export declare const isConvexStakedPhantomToken: (t: unknown) => t is ConvexStakedPhantomToken;
export {};
