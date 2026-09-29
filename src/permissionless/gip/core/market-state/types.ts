import type { Address } from "viem";
import { z } from "zod";
import type { AdapterState } from "../../plugins/adapters/logic.js";
import type { InterestRateModelState } from "../../plugins/irm/logic.js";
import type { LossPolicyState } from "../../plugins/loss-policies/logic.js";
import type { RateKeeperState } from "../../plugins/rate-keepers/logic.js";
import { percentageSchema } from "../validation.js";

export interface MarketAsset {
  address: Address;
  quotaLimit: number;
  quotaIncreaseFee: number;
  mainPriceFeed: Address;
  reservePriceFeed: Address;
}

export interface CollateralToken {
  liquidationThresholdFinal: number;
  rampStart: number;
  rampDuration: number;
  isForbidden: boolean;
}

export const creditManagerFeesSchema = z.object({
  feeLiquidation: percentageSchema,
  feeLiquidationExpired: percentageSchema,
  feeLiquidationPremium: percentageSchema,
  feeLiquidationPremiumExpired: percentageSchema,
});

export interface CreditManagerFees {
  feeLiquidation: number;
  feeLiquidationExpired: number;
  feeLiquidationPremium: number;
  feeLiquidationPremiumExpired: number;
}

export interface MarketCreditManagerState extends CreditManagerFees {
  address: Address;
  name: string;
  isExpired: boolean;
  expirable: boolean;
  expirationDate: number;
  feeInterest: number;
  maxEnabledTokens: number;
  collateralTokens: Record<Address, CollateralToken>;
  adapters: Record<Address, AdapterState>;
  degenNFT: Address;
  minDebt: number;
  maxDebt: number;
  maxDebtPerBlockMultiplier: number;
  paused: boolean;
}

export interface TreasuryState {
  address: Address;
  type: "TREASURY_SPLITTER" | "TREASURY";
  balances: Record<Address, number>;
}

export interface PeripheryState {
  address: Address;
  domain: string;
  type: string;
  version: number;
}

export const NO_LIMIT = "Unlimited";

export interface MarketState {
  minorVersion: number;
  address: Address;
  symbol: string;
  name: string;
  underlyingAsset: Address;
  underlyingPriceFeed: Address;
  totalDebtLimit: number | typeof NO_LIMIT;
  creditManagerDebtLimit: Record<Address, number>;
  assets: Record<Address, MarketAsset>;
  creditManagers: Record<Address, MarketCreditManagerState>;
  treasury: TreasuryState;
  rateKeeper: RateKeeperState;
  lossPolicy: LossPolicyState;
  interestRateModel: InterestRateModelState;
  paused: boolean;
  periphery: PeripheryState[];
}
