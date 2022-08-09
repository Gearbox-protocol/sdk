import { NetworkType } from "src/core/constants";
import { SupportedToken } from "../tokens/token";
export interface PriceFeed {
    token: string;
    priceFeed: string;
}
export declare enum OracleType {
    CHAINLINK_ORACLE = 0,
    YEARN_TOKEN_ORACLE = 1,
    CURVE_LP_ORACLE = 2,
    YEARN_CURVE_LP_ORACLE = 3,
    ZERO_ORACLE = 4,
    LIKE_CURVE_LP_ORACLE = 5
}
export declare type PriceFeedData = {
    type: OracleType.CHAINLINK_ORACLE;
    address: Record<NetworkType, string>;
} | {
    type: OracleType.YEARN_TOKEN_ORACLE;
    token: SupportedToken;
    address: Record<NetworkType, string>;
} | {
    type: OracleType.CURVE_LP_ORACLE;
    assets: Array<SupportedToken>;
} | {
    type: OracleType.YEARN_CURVE_LP_ORACLE;
    curveSymbol: SupportedToken;
} | {
    type: OracleType.ZERO_ORACLE;
} | {
    type: OracleType.LIKE_CURVE_LP_ORACLE;
    curveSymbol: SupportedToken;
};
export declare type TokenPriceFeedData = {
    priceFeedETH?: PriceFeedData;
    priceFeedUSD?: PriceFeedData;
};
