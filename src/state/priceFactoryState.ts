import type { PartialRecord } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import type { PriceFeedContractType } from "../market/pricefeeds";
import type { BaseContractState } from "./state";

export interface PriceOracleState {
  priceOracleV3: PriceOracleV3State;
  mainPriceFeeds: PartialRecord<Address, PriceFeedState>;
  reservePriceFeeds: PartialRecord<Address, PriceFeedState>;
}

export type PriceOracleV3State = BaseContractState;

export type PriceFeedState =
  | BoundedOracleState
  | AssetPriceFeedState
  | RedstonePriceFeedState;

export interface BasePriceFeedState extends BaseContractState {
  contractType: PriceFeedContractType;
  stalenessPeriod: number;
  skipCheck: boolean;
  trusted?: boolean;
}

export interface AssetPriceFeedState extends BasePriceFeedState {
  // type: Exclude<PriceFeedType, PriceFeedType.REDSTONE_ORACLE>;
  pricefeeds: Array<PriceFeedState>;
}

export interface BoundedOracleState extends AssetPriceFeedState {
  contractType: "PF_BOUNDED_ORACLE";
  upperBound: bigint;
}

export interface RedstonePriceFeedState extends BasePriceFeedState {
  contractType: "PF_REDSTONE_ORACLE";
  dataId: string;
  signers: Array<string>;
  signersThreshold: number;
}
