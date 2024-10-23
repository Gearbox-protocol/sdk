import type { Address } from "viem";

import type { PriceFeedContractType } from "../market";

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
  botList: BotListStateHuman;
  gearStakingV3: GearStakingV3StateHuman;
}

export type PriceFeedStateHuman =
  | BoundedOracleStateHuman
  | AssetPriceFeedStateHuman
  | RedstonePriceFeedStateHuman;

export interface BasePriceFeedStateHuman extends BaseContractStateHuman {
  stalenessPeriod: string;
  skipCheck: boolean;
  pricefeeds: PriceFeedStateHuman[];
  trusted?: boolean;
}

export interface BoundedOracleStateHuman extends BasePriceFeedStateHuman {
  contractType: "PF_BOUNDED_ORACLE";
  upperBound: bigint;
}

export interface AssetPriceFeedStateHuman extends BasePriceFeedStateHuman {
  contractType: PriceFeedContractType;
}

export interface RedstonePriceFeedStateHuman extends BasePriceFeedStateHuman {
  contractType: "PF_REDSTONE_ORACLE";
  dataId: string;
  signers: Array<string>;
  signersThreshold: number;
}

export interface PriceOracleV3StateHuman extends BaseContractStateHuman {
  mainPriceFeeds: Record<string, PriceFeedStateHuman>;
  reservePriceFeeds: Record<string, PriceFeedStateHuman>;
}

export interface CreditFacadeStateHuman extends BaseContractStateHuman {
  maxQuotaMultiplier: number;
  expirable: boolean;
  isDegenMode: boolean;
  degenNFT: string;
  expirationDate: number;
  maxDebtPerBlockMultiplier: number;
  botList: string;
  minDebt: string;
  maxDebt: string;
  currentCumulativeLoss: string;
  maxCumulativeLoss: string;
  forbiddenTokenMask: string;
  isPaused: boolean;
}

export interface CreditManagerStateHuman extends BaseContractStateHuman {
  name: string;
  accountFactory: string;
  underlying: string;
  pool: string;
  creditFacade: string;
  creditConfigurator: string;
  priceOracle: string;
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

export interface CreditFactoryStateHuman {
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
  totalAssets: string;
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
  currentEpoch: number;
  epochFrozen: boolean;
  quotaParams: Record<Address, GaugeParamsHuman>;
}

export interface LinearModelStateHuman extends BaseContractStateHuman {
  U1: string;
  U2: string;
  Rbase: string;
  Rslope1: string;
  Rslope2: string;
  Rslope3: string;
  isBorrowingMoreU2Forbidden: boolean;
}

export interface PoolFactoryStateHuman {
  pool: PoolStateHuman;
  poolQuotaKeeper: PoolQuotaKeeperStateHuman;
  linearModel?: LinearModelStateHuman;
  gauge: GaugeStateHuman;
}

export interface ZapperStateHuman extends BaseContractStateHuman {
  tokenIn: string;
  tokenOut: string;
}

export interface MarketStateHuman {
  pool: PoolFactoryStateHuman;
  creditManagers: CreditFactoryStateHuman[];
  priceOracle: PriceOracleV3StateHuman;
  pausableAdmins: string[];
  unpausableAdmins: string[];
  emergencyLiquidators: string[];
  zappers: ZapperStateHuman[];
}

export interface GearboxStateHuman {
  block: number;
  timestamp: number;
  core: CoreStateHuman;
  markets: MarketStateHuman[];
}
