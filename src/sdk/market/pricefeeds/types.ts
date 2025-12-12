import type { Address, Hex, UnionOmit } from "viem";
import type { IBaseContract, PriceFeedAnswer } from "../../base/index.js";
import type {
  IPriceUpdateTx,
  PriceFeedStateHuman,
  RawTx,
} from "../../types/index.js";
import type { PriceFeedRef } from "./PriceFeedRef.js";

export type PriceFeedUsageType = "Main" | "Reserve";

export type PriceFeedContractTypeLegacy =
  | "PF_BALANCER_STABLE_LP_ORACLE"
  | "PF_BALANCER_WEIGHTED_LP_ORACLE"
  | "PF_BOUNDED_ORACLE"
  | "PF_CHAINLINK_ORACLE"
  | "PF_COMPOSITE_ORACLE"
  | "PF_CURVE_CRYPTO_LP_ORACLE"
  | "PF_CURVE_STABLE_LP_ORACLE"
  | "PF_CURVE_USD_ORACLE"
  | "PF_ERC4626_ORACLE"
  | "PF_MELLOW_LRT_ORACLE"
  | "PF_PENDLE_PT_TWAP_ORACLE"
  | "PF_PYTH_ORACLE"
  | "PF_REDSTONE_ORACLE"
  | "PF_WSTETH_ORACLE"
  | "PF_YEARN_ORACLE"
  | "PF_ZERO_ORACLE";

export type PriceFeedContractType =
  | "PRICE_FEED::BALANCER_STABLE"
  | "PRICE_FEED::BALANCER_WEIGHTED"
  | "PRICE_FEED::BOUNDED"
  | "PRICE_FEED::COMPOSITE"
  | "PRICE_FEED::CONSTANT"
  | "PRICE_FEED::CURVE_CRYPTO"
  | "PRICE_FEED::CURVE_STABLE"
  | "PRICE_FEED::CURVE_USD"
  | "PRICE_FEED::ERC4626"
  | "PRICE_FEED::EXTERNAL"
  | "PRICE_FEED::MELLOW_LRT"
  | "PRICE_FEED::PENDLE_PT_TWAP"
  | "PRICE_FEED::PYTH"
  | "PRICE_FEED::REDSTONE"
  | "PRICE_FEED::WSTETH"
  | "PRICE_FEED::YEARN"
  | "PRICE_FEED::ZERO";

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
  /**
   * Latest answer for this price feed
   */
  readonly answer: PriceFeedAnswer;
  readonly skipCheck: boolean;

  readonly underlyingPriceFeeds: readonly PriceFeedRef[];

  updateAnswer: (answer: PriceFeedAnswer) => void;

  stateHuman: (
    raw?: boolean,
  ) => UnionOmit<PriceFeedStateHuman, "stalenessPeriod">;

  /**
   * Returns all updatable depenedencies (uderlying price feeds) of this price feed, including price feed itself, if it's updatable
   * @returns
   */
  updatableDependencies: () => IUpdatablePriceFeedContract[];
}

export interface IUpdatablePriceFeedContract extends IPriceFeedContract {
  createPriceUpdateTx: (data: `0x${string}`) => RawTx;
}

export interface UpdatePriceFeedsResult {
  txs: IPriceUpdateTx[];
  timestamp: number;
}

export interface PriceUpdateV310 {
  /**
   * IUpdatablePriceFeed contract address
   */
  priceFeed: Address;
  /**
   * Data that can be passed to IUpdatablePriceFeed.updatePrice
   */
  data: Hex;
}

export interface PriceUpdateV300 {
  token: Address;
  reserve: boolean;
  /**
   * Data that can be passed to IUpdatablePriceFeed.updatePrice
   */
  data: Hex;
}
