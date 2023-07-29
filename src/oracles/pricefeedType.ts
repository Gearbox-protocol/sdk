import { NetworkType } from "../core/chains";
import { AaveV2LPToken } from "../tokens/aave";
import { NormalToken } from "../tokens/normal";
import { SupportedToken } from "../tokens/token";

export interface PriceFeed {
  token: string;
  priceFeed: string;
}

export enum PriceFeedType {
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
  NETWORK_DEPENDENT,
}

export type PriceFeedData =
  | {
      type: PriceFeedType.CHAINLINK_ORACLE;
      address: string;
    }
  | {
      type: PriceFeedType.YEARN_ORACLE;
      token: SupportedToken;
    }
  | {
      type: PriceFeedType.CURVE_2LP_ORACLE;
      assets: Array<SupportedToken>;
    }
  | {
      type: PriceFeedType.CURVE_3LP_ORACLE;
      assets: Array<SupportedToken>;
    }
  | {
      type: PriceFeedType.CURVE_4LP_ORACLE;
      assets: Array<SupportedToken>;
    }
  | {
      type: PriceFeedType.ZERO_ORACLE;
    }
  | {
      type: PriceFeedType.BOUNDED_ORACLE;
      targetPriceFeed: string;
      upperBound: bigint;
    }
  | {
      type: PriceFeedType.WSTETH_ORACLE;
      token: SupportedToken;
    }
  | {
      type: PriceFeedType.COMPOSITE_ORACLE;
      targetToBasePriceFeed: string;
      baseToUsdPriceFeed: string;
    }
  | {
      type: PriceFeedType.CURVE_CRYPTO_ORACLE;
      assets: Array<SupportedToken>;
    }
  | {
      type: PriceFeedType.BALANCER_WEIGHTED_LP_ORACLE;
      assets: Array<SupportedToken>;
    }
  | {
      type: PriceFeedType.THE_SAME_AS;
      token: SupportedToken;
    }
  | {
      type: PriceFeedType.WRAPPED_AAVE_V2_ORACLE;
      underlying: AaveV2LPToken;
    }
  | {
      type: PriceFeedType.COMPOUND_V2_ORACLE;
      underlying: NormalToken;
    }
  | {
      type: PriceFeedType.ERC4626_VAULT_ORACLE;
      underlying: NormalToken;
    }
  | {
      type: PriceFeedType.REDSTONE_ORACLE;
      dataId: string;
      signers: Array<string>;
      signersThreshold: number;
    }
  | {
      type: PriceFeedType.NETWORK_DEPENDENT;
      feeds: Record<NetworkType, PriceFeedData>;
    };
