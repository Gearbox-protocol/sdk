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
} from "../abi";

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

export type ZapperData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof iPeripheryCompressorAbi, "getZappers">["outputs"]
  >
>;

export type GaugeData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof iGaugeCompressorAbi, "getGauge">["outputs"]
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

export type BotData = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof iPeripheryCompressorAbi, "getBots">["outputs"]
  >
>;

export type CreditManagerData = Unarray<MarketData["creditManagers"]>;

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
