import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address } from "viem";

import type {
  iCreditAccountCompressorAbi,
  iMarketCompressorAbi,
  iPriceFeedCompressorAbi,
} from "../abi";

type Unarray<A> = A extends readonly unknown[] ? Unarray<A[number]> : A;

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

export type CreditManagerData = Unarray<MarketData["creditManagers"]>;
export type TokenMetaData = Unarray<MarketData["tokens"]>;
export type PoolData = MarketData["pool"];
export type PoolQuotaKeeperData = MarketData["poolQuotaKeeper"];
export type RateKeeperData = MarketData["rateKeeper"];

export type GetPriceFeedsResult = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof iPriceFeedCompressorAbi, "getPriceFeeds">["outputs"]
>;
export type PriceFeedMapEntry = Unarray<GetPriceFeedsResult[0]>;
export type PriceFeedTreeNode = Unarray<GetPriceFeedsResult[1]>;

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
