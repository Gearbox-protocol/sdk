import { NetworkType } from "./constants";
export declare const supportedTokens: {
    "1INCH": {
        type: string;
    };
    AAVE: {
        type: string;
    };
    COMP: {
        type: string;
    };
    CRV: {
        type: string;
    };
    DAI: {
        type: string;
    };
    DPI: {
        type: string;
    };
    FEI: {
        type: string;
    };
    LINK: {
        type: string;
    };
    SNX: {
        type: string;
    };
    SUSHI: {
        type: string;
    };
    UNI: {
        type: string;
    };
    USDC: {
        type: string;
    };
    USDT: {
        type: string;
    };
    WBTC: {
        type: string;
    };
    WETH: {
        type: string;
    };
    YFI: {
        type: string;
    };
    STETH: {
        type: string;
    };
    FTM: {
        type: string;
    };
    CVX: {
        type: string;
    };
    FRAX: {
        type: string;
    };
    FXS: {
        type: string;
    };
    LDO: {
        type: string;
    };
    SPELL: {
        type: string;
    };
    LUSD: {
        type: string;
    };
    sUSD: {
        type: string;
    };
    GUSD: {
        type: string;
    };
    LUNA: {
        type: string;
    };
    LQTY: {
        type: string;
    };
    yvDAI: {
        type: string;
    };
    yvUSDC: {
        type: string;
    };
    yvWETH: {
        type: string;
    };
    yvWBTC: {
        type: string;
    };
    "3Crv": {
        type: string;
    };
    steCRV: {
        type: string;
    };
    FRAX3CRV: {
        type: string;
    };
    LUSD3CRV: {
        type: string;
    };
    crvPlain3andSUSD: {
        type: string;
    };
    gusd3CRV: {
        type: string;
    };
    cvx3Crv: {
        type: string;
    };
    cvxsteCRV: {
        type: string;
    };
    cvxFRAX3CRV: {
        type: string;
    };
    cvxcrvPlain3andSUSD: {
        type: string;
    };
    cvxgusd3CRV: {
        type: string;
    };
    yvCurve_stETH: {
        type: string;
    };
    yvCurve_FRAX: {
        type: string;
    };
    yvCurve_d3pool: {
        type: string;
    };
};
export declare type SupportedTokens = keyof typeof supportedTokens;
export declare const tokenDataByNetwork: Record<NetworkType, Record<SupportedTokens, string>>;
