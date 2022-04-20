import { BigNumber } from "ethers";

export interface PriceFeed {
  token: string;
  priceFeed: string;
}

export enum OracleType {
  CHAINLINK_ORACLE,
  YEARN_TOKEN_ORACLE,
  CURVE_LP_ORACLE,
  YEARN_CURVE_LP_ORACLE,
  ZERO_ORACLE,
}

export type PriceFeedData =
  | {
      type: OracleType.CHAINLINK_ORACLE;
      address: string;
      kovan?: string;
    }
  | {
      type: OracleType.YEARN_TOKEN_ORACLE;
      priceFeed: string;
      priceFeedKovan?: string;
      lowerBound: BigNumber;
      upperBound: BigNumber;
    }
  | {
      type: OracleType.CURVE_LP_ORACLE;
      assets: Array<string>
    }
  | {
      type: OracleType.YEARN_CURVE_LP_ORACLE;
      curveSymbol: string;
      lowerBound: BigNumber;
      upperBound: BigNumber;
    }
  | {
      type: OracleType.ZERO_ORACLE;
    };

export type TokenPriceFeedData = {
  priceFeedETH?: PriceFeedData;
  priceFeedUSD?: PriceFeedData;
};
