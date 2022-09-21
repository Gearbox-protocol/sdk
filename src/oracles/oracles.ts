import { NetworkType } from "../core/constants";
import { SupportedToken } from "../tokens/token";

export interface PriceFeed {
  token: string;
  priceFeed: string;
}

export enum OracleType {
  CHAINLINK_ORACLE,
  YEARN_TOKEN_ORACLE,
  CURVE_LP_TOKEN_ORACLE,
  YEARN_CURVE_LP_TOKEN_ORACLE,
  ZERO_ORACLE,
  LIKE_CURVE_LP_TOKEN_ORACLE,
  WSTETH_ORACLE,
}

export type PriceFeedData =
  | {
      type: OracleType.CHAINLINK_ORACLE;
      address: Record<NetworkType, string>;
    }
  | {
      type: OracleType.YEARN_TOKEN_ORACLE;
      token: SupportedToken;
    }
  | {
      type: OracleType.CURVE_LP_TOKEN_ORACLE;
      assets: Array<SupportedToken>;
    }
  | {
      type: OracleType.YEARN_CURVE_LP_TOKEN_ORACLE;
      curveSymbol: SupportedToken;
    }
  | {
      type: OracleType.ZERO_ORACLE;
    }
  | {
      type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE;
      curveSymbol: SupportedToken;
    }
  | {
      type: OracleType.WSTETH_ORACLE;
      token: SupportedToken;
    };

export interface TokenPriceFeedData {
  priceFeedETH?: PriceFeedData;
  priceFeedUSD: PriceFeedData;
}
