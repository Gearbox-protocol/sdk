import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address, Hex } from "viem";

import type { iCreditAccountCompressorAbi, iMarketCompressorAbi } from "../abi";

export type Unarray<A> = A extends readonly unknown[] ? Unarray<A[number]> : A;

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
    ExtractAbiFunction<typeof iMarketCompressorAbi, "getMarkets">["outputs"]
  >
>;

export type CreditManagerData = Unarray<MarketData["creditManagers"]>;
export type ZapperData = Unarray<MarketData["zappers"]>;
export type CreditManagerState = CreditManagerData["creditManager"];
export type CreditFacadeState = CreditManagerData["creditFacade"];
export type CreditConfiguratorState = CreditManagerData["creditConfigurator"];
export type AdapterData = Unarray<CreditManagerData["adapters"]>;
export type TokenMetaData = Unarray<MarketData["tokens"]>;
export type PoolData = MarketData["pool"];
export type PoolQuotaKeeperData = MarketData["poolQuotaKeeper"];
export type QuotaState = Unarray<PoolQuotaKeeperData["quotas"]>;
export type RateKeeperData = MarketData["rateKeeper"];
export type PriceOracleData = MarketData["priceOracleData"];
export type PriceFeedMapEntry = Unarray<PriceOracleData["priceFeedMapping"]>;
export type PriceFeedTreeNode = Unarray<PriceOracleData["priceFeedStructure"]>;
export type CreditManagerDebtParams = Unarray<
  PoolData["creditManagerDebtParams"]
>;

export enum VotingContractStatus {
  NOT_ALLOWED = 0,
  ALLOWED = 1,
  UNVOTE_ONLY = 2,
}
