import { BigNumber } from "ethers";
import { SupportedTokens } from "./token";
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
    address: string;
    kovan?: string;
} | {
    type: OracleType.YEARN_TOKEN_ORACLE;
    token: SupportedTokens;
    priceFeedKovan?: string;
    lowerBound: BigNumber;
    upperBound: BigNumber;
} | {
    type: OracleType.CURVE_LP_ORACLE;
    assets: Array<SupportedTokens>;
} | {
    type: OracleType.YEARN_CURVE_LP_ORACLE;
    curveSymbol: SupportedTokens;
    lowerBound: BigNumber;
    upperBound: BigNumber;
} | {
    type: OracleType.ZERO_ORACLE;
} | {
    type: OracleType.LIKE_CURVE_LP_ORACLE;
    curveSymbol: SupportedTokens;
};
export declare type TokenPriceFeedData = {
    priceFeedETH?: PriceFeedData;
    priceFeedUSD?: PriceFeedData;
};
