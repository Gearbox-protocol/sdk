import type { Address } from "viem";

import type { TokenMetaData } from "../base/index.js";
import type { PriceFeedContractType } from "../market/index.js";

export interface BaseContractStateHuman {
  address: string;
  version: number;
  contractType?: string;
}

export interface AddressProviderV3StateHuman extends BaseContractStateHuman {
  addresses: Record<string, Record<number, string>>;
}

export interface GearStakingV3StateHuman extends BaseContractStateHuman {
  successor: string;
  migrator: string;
}

export type BotListStateHuman = BaseContractStateHuman;

export interface CoreStateHuman {
  addressProviderV3: AddressProviderV3StateHuman;
  botList?: BotListStateHuman;
  gearStakingV3?: GearStakingV3StateHuman;
}

export type PriceFeedStateHuman =
  | BoundedOracleStateHuman
  | AssetPriceFeedStateHuman
  | RedstonePriceFeedStateHuman
  | LPPriceFeedStateHuman
  | BalancerWeightedPriceFeedStateHuman;

export interface BasePriceFeedStateHuman extends BaseContractStateHuman {
  description?: string;
  stalenessPeriod: string;
  skipCheck: boolean;
  pricefeeds: PriceFeedStateHuman[];
  trusted?: boolean;
}

export interface BoundedOracleStateHuman extends BasePriceFeedStateHuman {
  contractType: "PRICE_FEED::BOUNDED";
  upperBound: bigint;
}

export interface ConstantOracleStateHuman extends BasePriceFeedStateHuman {
  contractType: "PRICE_FEED::CONSTANT";
  price: bigint;
}

export interface AssetPriceFeedStateHuman extends BasePriceFeedStateHuman {
  contractType: PriceFeedContractType;
}

export interface LPPriceFeedStateHuman extends BasePriceFeedStateHuman {
  contractType: PriceFeedContractType;
  lpContract: Address;
  lpToken: Address;
  lowerBound: bigint;
  upperBound: bigint;
  // v3.0 optionals
  exchangeRate?: string;
  aggregatePrice?: string;
  scale?: string;
}

export interface BalancerWeightedPriceFeedStateHuman
  extends LPPriceFeedStateHuman {
  contractType: "PRICE_FEED::BALANCER_WEIGHTED";
  vault: Address;
  poolId: Address;
  weights: [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
}

export interface RedstonePriceFeedStateHuman extends BasePriceFeedStateHuman {
  contractType: "PRICE_FEED::REDSTONE";
  dataId: string;
  signers: Array<string>;
  signersThreshold: number;
  lastPrice: string;
  lastPayloadTimestamp: string;
}

export interface PriceOracleStateHuman extends BaseContractStateHuman {
  mainPriceFeeds: Record<string, PriceFeedStateHuman>;
  reservePriceFeeds: Record<string, PriceFeedStateHuman>;
  mainPrices: Record<string, string>;
  reservePrices: Record<string, string>;
}

export interface CreditFacadeStateHuman extends BaseContractStateHuman {
  expirable: boolean;
  isDegenMode: boolean;
  degenNFT: string;
  expirationDate: string;
  maxDebtPerBlockMultiplier: number;
  botList: string;
  minDebt: string;
  maxDebt: string;
  forbiddenTokensMask: string;
  isPaused: boolean;
}

export interface CreditManagerStateHuman extends BaseContractStateHuman {
  name: string;
  accountFactory: string;
  underlying: string;
  pool: string;
  creditFacade: string;
  creditConfigurator: string;
  maxEnabledTokens: number;
  collateralTokens: Record<string, string>;
  feeInterest: string;
  feeLiquidation: string;
  liquidationDiscount: string;
  feeLiquidationExpired: string;
  liquidationDiscountExpired: string;
  quotedTokensMask: string;
  contractsToAdapters: Record<string, string>;
  creditAccounts: Array<Address>;
}

export type CreditConfiguratorStateHuman = BaseContractStateHuman;

export interface CreditSuiteStateHuman {
  isExpired: boolean;
  creditFacade: CreditFacadeStateHuman;
  creditManager: CreditManagerStateHuman;
  creditConfigurator: CreditConfiguratorStateHuman;
}

export interface CreditManagerDebtParamsHuman {
  borrowed: string;
  limit: string;
  availableToBorrow: string;
}

export interface PoolStateHuman extends BaseContractStateHuman {
  underlying: string;
  symbol: string;
  name: string;
  decimals: number;
  availableLiquidity: string;
  expectedLiquidity: string;
  totalBorrowed: string;
  totalDebtLimit: string;
  creditManagerDebtParams: Record<string, CreditManagerDebtParamsHuman>;
  totalSupply: string;
  supplyRate: string;
  baseInterestIndex: string;
  baseInterestRate: string;
  withdrawFee: string;
  lastBaseInterestUpdate: string;
  baseInterestIndexLU: string;
  isPaused: boolean;
}

export interface QuotaParamsHuman {
  rate: number;
  quotaIncreaseFee: number;
  totalQuoted: string;
  limit: string;
  isActive: boolean;
}

export interface PoolQuotaKeeperStateHuman extends BaseContractStateHuman {
  quotas: Record<Address, QuotaParamsHuman>;
}

export interface GaugeParamsHuman {
  minRate: string;
  maxRate: string;
  totalVotesLpSide: number;
  totalVotesCaSide: number;
  rate: string;
}

export interface GaugeStateHuman extends BaseContractStateHuman {
  epochLastUpdate: number;
  epochFrozen: boolean;
  quotaParams: Record<Address, GaugeParamsHuman>;
}

export interface TumblerStateHuman extends BaseContractStateHuman {
  epochLength: string;
  rates: Record<string, string>;
}

export type RateKeeperStateHuman = GaugeStateHuman | TumblerStateHuman;

export interface LinearInterestRateModelStateHuman
  extends BaseContractStateHuman {
  U1: string;
  U2: string;
  Rbase: string;
  Rslope1: string;
  Rslope2: string;
  Rslope3: string;
  isBorrowingMoreU2Forbidden: boolean;
}

export type InterestRateModelStateHuman = LinearInterestRateModelStateHuman;

export interface PoolSuiteStateHuman {
  pool: PoolStateHuman;
  poolQuotaKeeper: PoolQuotaKeeperStateHuman;
  interestRateModel?: InterestRateModelStateHuman;
  rateKeeper: RateKeeperStateHuman;
}

export interface AliasLossPolicyStateHuman extends BaseContractStateHuman {
  contractType: "LOSS_POLICY::ALIASED";
  accessMode: string;
  checksEnabled: boolean;
  tokens: string[];
  priceFeedParams: {
    priceFeed: string;
    stalenessPeriod: string;
    skipCheck: boolean;
    tokenDecimals: number;
  }[];
}

export type LossPolicyStateHuman =
  | AliasLossPolicyStateHuman
  | BaseContractStateHuman;

export interface MarketStateHuman {
  configurator: string;
  pool: PoolSuiteStateHuman;
  creditManagers: CreditSuiteStateHuman[];
  priceOracle: PriceOracleStateHuman;
  lossPolicy: LossPolicyStateHuman;
  pausableAdmins: string[];
  unpausableAdmins: string[];
  emergencyLiquidators: string[];
}

export interface GearboxStateHuman {
  block: number;
  timestamp: string;
  core: CoreStateHuman;
  markets: MarketStateHuman[];
  plugins: Record<string, unknown>;
  tokens: TokenMetaData[];
}
