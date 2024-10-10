import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address, Hex } from "viem";

import type {
  iAdapterCompressorAbi,
  iCreditAccountCompressorAbi,
  iMarketCompressorAbi,
} from "../abi";

type Unarray<A> = A extends readonly unknown[] ? Unarray<A[number]> : A;

export interface BaseParams {
  addr: Address;
  version: bigint;
  contractType: Hex;
  serializedParams: Hex;
}

export type CreditAccountData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof iCreditAccountCompressorAbi,
      "getCreditAccountData"
    >["outputs"]
  >
>;

export type MarketData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof iMarketCompressorAbi, "getMarketData">["outputs"]
  >
>;

export type AdapterData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof iAdapterCompressorAbi,
      "getContractAdapters"
    >["outputs"]
  >
>;

export type CreditManagerData = Unarray<MarketData["creditManagers"]>;
export type TokenMetaData = Unarray<MarketData["tokens"]>;
export type PoolData = MarketData["pool"];
export type PoolQuotaKeeperData = MarketData["poolQuotaKeeper"];
export type RateKeeperData = MarketData["rateKeeper"];
export type PriceOracleData = MarketData["priceOracleData"];
export type PriceFeedMapEntry = Unarray<PriceOracleData["priceFeedMapping"]>;
export type PriceFeedTreeNode = Unarray<PriceOracleData["priceFeedStructure"]>;

export interface CreditManagerDebtParamsStruct {
  creditManager: Address;
  borrowed: bigint;
  limit: bigint;
  availableToBorrow: bigint;
}

export enum VotingContractStatus {
  NOT_ALLOWED = 0,
  ALLOWED = 1,
  UNVOTE_ONLY = 2,
}
