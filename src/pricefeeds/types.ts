import { Address, Hex } from "viem";
import { RawTx } from "../../core/transactions";
import { PriceFeedState } from "../state/priceFactoryState";
import { BaseContractState } from "../state/state";

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

export interface PriceFeedContractParams {
  address: Address;
  stalenessPeriod: number;
  trusted: boolean;
}

export interface PriceFeedParams extends PriceFeedContractParams {
  priceFeedType: PriceFeedContractType;
}

export interface PriceFeedParamsStruct {
  priceFeed: Address;
  stalenessPeriod: number;
}

export interface IPriceFeedContract {
  hasLowerBoundCap: boolean;

  updatable: boolean;
  address: Address;
  priceFeedType: PriceFeedContractType;
  stalenessPeriod: number;
  decimals: number;

  state: PriceFeedState;

  params: PriceFeedParamsStruct;

  answer(overrides?: { blockNumber?: bigint }): Promise<bigint>;

  test_setAddress(address: Address): void;
}

export interface UpdatePFTask {
  priceFeed: Address;
  tx: RawTx;
  timestamp: number;
}

export interface ILPPriceFeedContract extends IPriceFeedContract {
  getValue(): Promise<bigint>;

  getLowerBound(): Promise<bigint>;

  currentLowerBound(): Promise<bigint>;
}

export interface PriceFeedCompressorData extends BaseContractState {
  contractType: PriceFeedContractType;
  serializedParams: Hex;
  skipCheck: boolean;
  updatable: boolean;
  underlyingFeeds: Array<Address>;
  underlyingStalenessPeriods: Array<number>;
  price: bigint;
  decimals: number;
}
