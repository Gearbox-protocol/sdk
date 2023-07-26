import { NetworkType } from "../core/chains";
import { AaveV2LPToken } from "../tokens/aave";
import { NormalToken } from "../tokens/normal";
import { SupportedToken } from "../tokens/token";

export interface PriceFeed {
  token: string;
  priceFeed: string;
}

export enum OracleType {
  CHAINLINK_ORACLE,
  YEARN_ORACLE,
  CURVE_2LP_ORACLE,
  CURVE_3LP_ORACLE,
  CURVE_4LP_ORACLE,
  ZERO_ORACLE,
  WSTETH_ORACLE,
  BOUNDED_ORACLE,
  COMPOSITE_ORACLE,
  WRAPPED_AAVE_V2_ORACLE,
  COMPOUND_V2_ORACLE,
  BALANCER_STABLE_LP_ORACLE,
  BALANCER_WEIGHTED_LP_ORACLE,
  CURVE_CRYPTO_ORACLE,
  THE_SAME_AS,
  REDSTONE_ORACLE,
  ERC4626_VAULT_ORACLE,
  NETWORK_DIFFERENT,
}

export type PriceFeedData =
  | {
      type: OracleType.CHAINLINK_ORACLE;
      address: Record<NetworkType, string>;
    }
  | {
      type: OracleType.YEARN_ORACLE;
      token: SupportedToken;
    }
  | {
      type: OracleType.CURVE_2LP_ORACLE;
      assets: Array<SupportedToken>;
    }
  | {
      type: OracleType.CURVE_3LP_ORACLE;
      assets: Array<SupportedToken>;
    }
  | {
      type: OracleType.CURVE_4LP_ORACLE;
      assets: Array<SupportedToken>;
    }
  | {
      type: OracleType.ZERO_ORACLE;
    }
  | {
      type: OracleType.BOUNDED_ORACLE;
      targetPriceFeed: Record<NetworkType, string>;
      upperBound: bigint;
    }
  | {
      type: OracleType.WSTETH_ORACLE;
      token: SupportedToken;
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
    }
  | {
      type: OracleType.THE_SAME_AS;
      token: SupportedToken;
    }
  | {
      type: OracleType.WRAPPED_AAVE_V2_ORACLE;
      underlying: AaveV2LPToken;
    }
  | {
      type: OracleType.COMPOUND_V2_ORACLE;
      underlying: NormalToken;
    }
  | {
      type: OracleType.REDSTONE_ORACLE;
      dataId: string;
      signers: Array<string>;
      signersThreshold: number;
    };
