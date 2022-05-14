import { NetworkType } from "./constants";
import { ConvexPoolContract } from "./contracts";
import { TradeAction } from "./tradeTypes";
export declare enum TokenType {
    CONNECTOR = 0,
    NORMAL_TOKEN = 1,
    CURVE_LP = 2,
    META_CURVE_LP = 3,
    YEARN_VAULT = 4,
    YEARN_VAULT_OF_CURVE_LP = 5,
    YEARN_VAULT_OF_META_CURVE_LP = 6,
    CONVEX_LP_TOKEN = 7,
    CONVEX_STAKED_PHANTOM_TOKEN = 8
}
export declare const priority: Record<TokenType, number>;
export declare type NormalToken = "1INCH" | "AAVE" | "COMP" | "CRV" | "DAI" | "DPI" | "FEI" | "LINK" | "SNX" | "SUSHI" | "UNI" | "USDC" | "USDT" | "WBTC" | "WETH" | "YFI" | "STETH" | "FTM" | "CVX" | "FRAX" | "FXS" | "LDO" | "SPELL" | "LUSD" | "sUSD" | "GUSD" | "LUNA" | "LQTY";
export declare type CurveLPToken = "3Crv" | "steCRV" | "FRAX3CRV" | "LUSD3CRV" | "crvPlain3andSUSD" | "gusd3CRV";
export declare type YearnLPToken = "yvDAI" | "yvUSDC" | "yvWETH" | "yvWBTC" | "yvCurve_stETH" | "yvCurve_FRAX";
export declare type ConvexLPToken = "cvx3Crv" | "cvxsteCRV" | "cvxFRAX3CRV" | "cvxcrvPlain3andSUSD" | "cvxgusd3CRV";
export declare type ConvexStakedPhantomToken = "stkcvx3Crv" | "stkcvxsteCRV" | "stkcvxFRAX3CRV" | "stkcvxcrvPlain3andSUSD" | "stkcvxgusd3CRV";
export declare type SupportedToken = NormalToken | YearnLPToken | CurveLPToken | ConvexLPToken | ConvexStakedPhantomToken;
export declare type TokenDataI = {
    symbol: NormalToken;
    type: TokenType.CONNECTOR;
    swapActions: Array<TradeAction>;
    lpActions?: Array<TradeAction>;
} | {
    symbol: NormalToken;
    type: TokenType.NORMAL_TOKEN;
    swapActions: Array<TradeAction>;
    lpActions?: Array<TradeAction>;
} | {
    symbol: CurveLPToken;
    type: TokenType.CURVE_LP;
    swapActions?: Array<TradeAction>;
    lpActions: Array<TradeAction>;
} | {
    symbol: YearnLPToken;
    type: TokenType.YEARN_VAULT;
    underlying: NormalToken;
    lpActions: Array<TradeAction>;
} | {
    symbol: CurveLPToken;
    type: TokenType.META_CURVE_LP;
    lpActions: Array<TradeAction>;
} | {
    symbol: YearnLPToken;
    type: TokenType.YEARN_VAULT_OF_CURVE_LP;
    underlying: CurveLPToken;
    lpActions: Array<TradeAction>;
} | {
    symbol: YearnLPToken;
    type: TokenType.YEARN_VAULT_OF_META_CURVE_LP;
    underlying: CurveLPToken;
    lpActions: Array<TradeAction>;
} | {
    symbol: ConvexLPToken;
    type: TokenType.CONVEX_LP_TOKEN;
    pool: ConvexPoolContract;
    underlying: CurveLPToken;
    stakedToken: ConvexStakedPhantomToken;
    lpActions: Array<TradeAction>;
} | {
    symbol: ConvexStakedPhantomToken;
    type: TokenType.CONVEX_STAKED_PHANTOM_TOKEN;
    pool: ConvexPoolContract;
    underlying: CurveLPToken;
    lpToken: ConvexLPToken;
    lpActions: Array<TradeAction>;
};
export declare const supportedTokens: Record<SupportedToken, TokenDataI>;
export declare const tokenDataByNetwork: Record<NetworkType, Record<SupportedToken, string>>;
