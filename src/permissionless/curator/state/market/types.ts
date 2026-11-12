import type { Address } from "viem";
import { z } from "zod/v4";
import type { CreditManagerFees } from "../../../bindings/types.js";
import type { AdapterState } from "../../plugins/adapters/builtinAdapterPlugins.js";
import type { AdapterStateBase } from "../../plugins/adapters/defineAdapterPlugin.js";
import type { InterestRateModelState } from "../../plugins/irm/irmPlugins.js";
import type { LossPolicyState } from "../../plugins/loss-policies/lossPolicyPlugins.js";
import type { RateKeeperState } from "../../plugins/rate-keepers/rateKeeperPlugins.js";
import {
  percentageSchema,
  refineLiquidationFees,
} from "../../validationSchemas.js";

export interface MarketAsset {
  address: Address;
  quotaLimit: number;
  quotaIncreaseFee: number;
  mainPriceFeed: Address;
  reservePriceFeed: Address;
}

export interface CollateralToken {
  /** Absent in legacy snapshots; an active ramp then has an unknown initial LT. **/
  liquidationThresholdInitial?: number;
  liquidationThresholdFinal: number;
  rampStart: number;
  rampDuration: number;
  isForbidden: boolean;
}

export const creditManagerFeesSchema = z
  .object({
    feeLiquidation: percentageSchema,
    feeLiquidationExpired: percentageSchema,
    feeLiquidationPremium: percentageSchema,
    feeLiquidationPremiumExpired: percentageSchema,
  })
  .superRefine(refineLiquidationFees);

export interface MarketCreditManagerState extends CreditManagerFees {
  address: Address;
  name: string;
  isExpired: boolean;
  expirable: boolean;
  expirationDate: number;
  feeInterest: number;
  maxEnabledTokens: number;
  collateralTokens: Record<Address, CollateralToken>;
  /**
   * By target. A built-in adapter's state, or the state of an adapter whose
   * plugin is registered with the SDK (or that no plugin describes).
   **/
  adapters: Record<Address, AdapterState | AdapterStateBase>;
  degenNFT: Address;
  /** Current facade; unknown immediately after an unpredicted upgrade. **/
  creditFacade?: Address;
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

/**
 * - `deployed`: deployed by an earlier action of the GIP (or found deployed on
 *   chain), not registered with the configurator yet;
 * - `registered`: registered as periphery of the configurator.
 **/
export type PeripheryStatus = "deployed" | "registered";

export interface PeripheryState {
  address: Address;
  domain: string;
  type: string;
  version: number;
  /**
   * States persisted before deployments were tracked have no status; their
   * entries are registered (see `peripheryStatus`).
   **/
  status: PeripheryStatus;
}

/** Status of a periphery entry, defaulting legacy entries to `registered`. **/
export function peripheryStatus(entry: PeripheryState): PeripheryStatus {
  return entry.status ?? "registered";
}

export const NO_LIMIT = "Unlimited";

export interface MarketState {
  minorVersion: number;
  address: Address;
  symbol: string;
  name: string;
  underlyingAsset: Address;
  underlyingPriceFeed: Address;
  underlyingReservePriceFeed?: Address;
  totalDebtLimit: number | typeof NO_LIMIT;
  creditManagerDebtLimit: Record<Address, number | typeof NO_LIMIT>;
  assets: Record<Address, MarketAsset>;
  creditManagers: Record<Address, MarketCreditManagerState>;
  treasury: TreasuryState;
  rateKeeper: RateKeeperState;
  lossPolicy: LossPolicyState;
  interestRateModel: InterestRateModelState;
  paused: boolean;
  periphery: PeripheryState[];
}
