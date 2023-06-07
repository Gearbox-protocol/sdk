import { BigNumber } from "ethers";

import { NetworkType } from "../core/chains";
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
  BOUNDED_ORACLE,
  COMPOSITE_ORACLE,
  CURVE_CRYPTO_ORACLE,
  BALANCER_WEIGHTED_LP_ORACLE,
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
    }
  | {
      type: OracleType.BOUNDED_ORACLE;
      targetPriceFeed: Record<NetworkType, string>;
      upperBound: BigNumber;
    }
  | {
      type: OracleType.COMPOSITE_ORACLE;
      targetToBasePriceFeed: Record<NetworkType, string>;
      baseToUsdPriceFeed: Record<NetworkType, string>;
    }
  | {
      type: OracleType.CURVE_CRYPTO_ORACLE;
      assets: Array<SupportedToken>;
    }
  | {
      type: OracleType.BALANCER_WEIGHTED_LP_ORACLE;
      assets: Array<SupportedToken>;
    };

export interface TokenPriceFeedData {
  priceFeedETH?: PriceFeedData;
  priceFeedUSD: PriceFeedData;
}
