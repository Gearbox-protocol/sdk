import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address, Hex } from "viem";

import type {
  iCreditAccountCompressorAbi,
  iGaugeCompressorAbi,
  iMarketCompressorAbi,
  iPeripheryCompressorAbi,
  iRewardsCompressorAbi,
} from "../../abi/compressors.js";

export type Unarray<A> = A extends readonly unknown[] ? Unarray<A[number]> : A;

export interface BaseParams {
  addr: Address;
  version: bigint;
  contractType: Hex;
  serializedParams: Hex;
}

export interface BaseState {
  baseParams: BaseParams;
}

export type MarketFilter = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof iMarketCompressorAbi, "getMarkets">["inputs"]
>[0];

export type CreditAccountData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof iCreditAccountCompressorAbi,
      "getCreditAccountData"
    >["outputs"]
  >
>;

export type RewardInfo = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof iRewardsCompressorAbi, "getRewards">["outputs"]
  >
>;

export type MarketData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof iMarketCompressorAbi, "getMarkets">["outputs"]
  >
>;

export type GaugeData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof iGaugeCompressorAbi, "getGaugeInfo">["outputs"]
  >
>;

export type ConnectedBotData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof iPeripheryCompressorAbi,
      "getConnectedBots"
    >["outputs"]
  >
>;

export type CreditSuiteState = Unarray<MarketData["creditManagers"]>;
export type CreditManagerState = CreditSuiteState["creditManager"];
export type CreditFacadeState = CreditSuiteState["creditFacade"];
export type CreditConfiguratorState = CreditSuiteState["creditConfigurator"];
export type AdapterData = Unarray<CreditSuiteState["adapters"]>;

export type TokenMetaData = Unarray<MarketData["tokens"]>;
export type PoolState = MarketData["pool"];
export type QuotaKeeperState = MarketData["quotaKeeper"];
export type QuotaState = Unarray<QuotaKeeperState["quotas"]>;
export type RateKeeperState = MarketData["rateKeeper"];
export type PriceOracleData = MarketData["priceOracle"];
export type PriceFeedMapEntry = Unarray<PriceOracleData["priceFeedMap"]>;
export type PriceFeedTreeNode = Unarray<PriceOracleData["priceFeedTree"]>;
export type PriceFeedAnswer = PriceFeedTreeNode["answer"];
export type CreditManagerDebtParams = Unarray<
  PoolState["creditManagerDebtParams"]
>;

export enum VotingContractStatus {
  NOT_ALLOWED = 0,
  ALLOWED = 1,
  UNVOTE_ONLY = 2,
}
