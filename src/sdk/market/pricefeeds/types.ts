import type { IBaseContract } from "../../base";
import type { PriceFeedState } from "../../state";
import type { RawTx } from "../../types";

export type PriceFeedUsageType = "Main" | "Reserve";

export type PriceFeedContractType =
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
  | "PF_REDSTONE_ORACLE";

export interface IPriceFeedContract extends IBaseContract {
  readonly hasLowerBoundCap: boolean;
  readonly priceFeedType: PriceFeedContractType;
  readonly decimals: number;
  readonly state: Omit<PriceFeedState, "stalenessPeriod">;
  /**
   * True if the contract deployed at this address implements IUpdatablePriceFeed interface
   */
  readonly updatable: boolean;

  answer: (overrides?: { blockNumber?: bigint }) => Promise<bigint>;

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
