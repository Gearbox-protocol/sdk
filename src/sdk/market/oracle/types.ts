import type { Address, Hex } from "viem";

import type { IBaseContract } from "../../base/index.js";
import type { PriceOracleV310Contract } from "../index.js";
import type {
  IPriceFeedContract,
  UpdatePriceFeedsResult,
} from "../pricefeeds/index.js";
import type { PriceOracleV300Contract } from "./PriceOracleV300Contract.js";

export type PriceOracleContract =
  | PriceOracleV300Contract
  | PriceOracleV310Contract;

export interface PriceFeedsForTokensOptions {
  main?: boolean;
  reserve?: boolean;
}

/**
 * Data to be passed to credit facade's multicall
 * Compatible with both v300 and v310 facades
 */
export interface OnDemandPriceUpdate {
  priceFeed: Address;
  token: Address;
  reserve: boolean;
  data: Hex;
}

export interface IPriceOracleContract extends IBaseContract {
  priceFeedsForTokens: (
    tokens: Address[],
    opts?: PriceFeedsForTokensOptions,
  ) => IPriceFeedContract[];
  updatePriceFeeds: () => Promise<UpdatePriceFeedsResult>;
  onDemandPriceUpdates: (
    updates?: UpdatePriceFeedsResult,
  ) => OnDemandPriceUpdate[];
  convertToUnderlying: (
    token: Address,
    amount: bigint,
    reserve?: boolean,
  ) => bigint;
  convert: (
    from: Address,
    to: Address,
    amount: bigint,
    reserve?: boolean,
  ) => bigint;
}
