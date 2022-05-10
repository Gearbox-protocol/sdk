import { NetworkType } from "./constants";
declare enum TokenType {
    CONNECTOR = 0,
    NORMAL_TOKEN = 1,
    CURVE_LP = 2,
    META_CURVE_LP = 3,
    YEARN_VAULT = 4,
    YEARN_VAULT_OF_CURVE_LP = 5,
    YEARN_VAULT_OF_META_CURVE_LP = 6,
    CONVEX_PHANTOM = 7
}
export declare const priority: {
    0: number;
    1: number;
    2: number;
    4: number;
    3: number;
    5: number;
    7: number;
    6: number;
};
export declare type TokenDataI = {
    type: TokenType.CONNECTOR;
} | {
    type: TokenType.NORMAL_TOKEN;
} | {
    type: TokenType.CURVE_LP;
} | {
    type: TokenType.YEARN_VAULT;
} | {
    type: TokenType.META_CURVE_LP;
} | {
    type: TokenType.YEARN_VAULT_OF_CURVE_LP;
} | {
    type: TokenType.CONVEX_PHANTOM;
} | {
    type: TokenType.YEARN_VAULT_OF_META_CURVE_LP;
};
export declare type SupportedTokens = "1INCH" | "AAVE" | "COMP" | "CRV" | "DAI" | "DPI" | "FEI" | "LINK" | "SNX" | "SUSHI" | "UNI" | "USDC" | "USDT" | "WBTC" | "WETH" | "YFI" | "STETH" | "FTM" | "CVX" | "FRAX" | "FXS" | "LDO" | "SPELL" | "LUSD" | "sUSD" | "GUSD" | "LUNA" | "LQTY" | "yvDAI" | "yvUSDC" | "yvWETH" | "yvWBTC" | "3Crv" | "steCRV" | "FRAX3CRV" | "LUSD3CRV" | "crvPlain3andSUSD" | "gusd3CRV" | "cvx3Crv" | "cvxsteCRV" | "cvxFRAX3CRV" | "cvxcrvPlain3andSUSD" | "cvxgusd3CRV" | "yvCurve_stETH" | "yvCurve_FRAX";
export declare const supportedTokens: Record<SupportedTokens, TokenDataI>;
export declare const tokenDataByNetwork: Record<NetworkType, Record<SupportedTokens, string>>;
export {};
