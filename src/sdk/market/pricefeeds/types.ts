import type { UnionOmit } from "viem";

import type { IBaseContract } from "../../base";
import type { PriceFeedStateHuman, RawTx } from "../../types";
import type { PriceFeedRef } from "./PriceFeedRef";

export type PriceFeedUsageType = "Main" | "Reserve";

export type PriceFeedContractTypeLegacy =
  | "PF_CHAINLINK_ORACLE"
  | "PF_ZERO_ORACLE"
  | "PF_COMPOSITE_ORACLE"
  | "PF_BALANCER_STABLE_LP_ORACLE"
  | "PF_CURVE_STABLE_LP_ORACLE"
  | "PF_CURVE_CRYPTO_LP_ORACLE"
  | "PF_CURVE_USD_ORACLE"
  | "PF_ERC4626_ORACLE"
  | "PF_WSTETH_ORACLE"
  | "PF_YEARN_ORACLE"
  | "PF_MELLOW_LRT_ORACLE"
  | "PF_BALANCER_WEIGHTED_LP_ORACLE"
  | "PF_BOUNDED_ORACLE"
  | "PF_PYTH_ORACLE"
  | "PF_REDSTONE_ORACLE"
  | "PF_PENDLE_PT_TWAP_ORACLE";

export type PriceFeedContractType =
  | "PRICE_FEED::EXTERNAL"
  | "PRICE_FEED::ZERO"
  | "PRICE_FEED::COMPOSITE"
  | "PRICE_FEED::BALANCER_STABLE"
  | "PRICE_FEED::CURVE_STABLE"
  | "PRICE_FEED::CURVE_CRYPTO"
  | "PRICE_FEED::CURVE_USD"
  | "PRICE_FEED::ERC4626"
  | "PRICE_FEED::WSTETH"
  | "PRICE_FEED::YEARN"
  | "PRICE_FEED::MELLOW_LRT"
  | "PRICE_FEED::BALANCER_WEIGHTED"
  | "PRICE_FEED::BOUNDED"
  | "PRICE_FEED::PYTH"
  | "PRICE_FEED::REDSTONE"
  | "PRICE_FEED::PENDLE_PT_TWAP";

export interface IPriceFeedContract extends IBaseContract {
  readonly hasLowerBoundCap: boolean;
  readonly priceFeedType: PriceFeedContractType;
  readonly decimals: number;
  /**
   * True if the contract deployed at this address implements IUpdatablePriceFeed interface
   */
  readonly updatable: boolean;
  /**
   * It's possible to create PriceFeed with base params only.
   * This flag idicates that all the price feed data (decimals, skip check, dependencies...) has been loaded from compressor
   */
  readonly loaded: boolean;

  readonly underlyingPriceFeeds: readonly PriceFeedRef[];

  answer: (overrides?: { blockNumber?: bigint }) => Promise<bigint>;
  stateHuman: (
    raw?: boolean,
  ) => UnionOmit<PriceFeedStateHuman, "stalenessPeriod">;

  /**
   * Returns all updatable depenedencies (uderlying price feeds) of this price feed, including price feed itself, if it's updatable
   * @returns
   */
  updatableDependencies: () => IPriceFeedContract[];
}

export interface ILPPriceFeedContract extends IPriceFeedContract {
  getValue: () => Promise<bigint>;
  getLowerBound: () => Promise<bigint>;
  currentLowerBound: () => Promise<bigint>;
}

export interface UpdatePriceFeedsResult {
  txs: RawTx[];
  timestamp: number;
}
