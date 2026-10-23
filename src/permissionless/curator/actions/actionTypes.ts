import type { Address } from "viem";
import type { CreditManagerFees } from "../../bindings/types.js";
import type { GipRegistry } from "../GipRegistry.js";
import {
  DEFAULT_INTEREST_RATE_MODEL_PARAMS,
  type InterestRateModelParams,
} from "../plugins/irm/irmPlugins.js";
import {
  DEFAULT_LOSS_POLICY_PARAMS,
  type LossPolicyDeployParams,
} from "../plugins/loss-policies/lossPolicyPlugins.js";
import {
  DEFAULT_RATE_KEEPER_PARAMS,
  type RateKeeperDeployParams,
} from "../plugins/rate-keepers/rateKeeperPlugins.js";

export type BaseMarketAction<T extends string, P extends object> = {
  type: T;
  params: P;
};

/** What the steps of an action may depend on besides the state and params. **/
export interface ActionEnv {
  /**
   * Unix time (seconds) time-dependent fields are derived at, e.g. whether a
   * credit manager is expired. The SDK uses its source block's timestamp.
   **/
  timestamp: number;
  /** The action definitions and adapter plugins in use. **/
  registry: GipRegistry;
}

export interface BasicParams {
  minorVersion: number;
  name: string;
  symbol: string;
  underlying: Address;
  underlyingPriceFeed: Address;
}

export interface CreateMarketParams extends BasicParams {
  interestRateModel: InterestRateModelParams;
  rateKeeperParams: RateKeeperDeployParams;
  lossPolicyParams: LossPolicyDeployParams;
}

export interface CreateMarketExtendedParams extends CreateMarketParams {
  debtLimit?: number;
}

export const defaultCreateMarketParams: CreateMarketParams = {
  minorVersion: 310,
  underlying: "0x0000000000000000000000000000000000000000",
  underlyingPriceFeed: "0x0000000000000000000000000000000000000000",
  name: "",
  symbol: "",

  interestRateModel: DEFAULT_INTEREST_RATE_MODEL_PARAMS,
  rateKeeperParams: DEFAULT_RATE_KEEPER_PARAMS,
  lossPolicyParams: DEFAULT_LOSS_POLICY_PARAMS,
};

// Credit Suite

export const AccountFactoryTypes = ["DEFAULT"] as const;
export type AccountFactoryType = (typeof AccountFactoryTypes)[number];

export interface DeployCreateSuiteParams extends CreditManagerFees {
  /**
   * Lets later actions of the GIP name the suite as `suite:<id>` before its
   * address is known; see `creditManagerTargets.ts`. Not sent on chain.
   **/
  id?: string;
  name: string;
  salt?: string;
  maxEnabledTokens: number;
  feeInterest: number;
  minDebt: number;
  maxDebt: number;
  minorVersion: 310; // | 320;
  accountFactoryType: AccountFactoryType;
  isExpired: boolean;
  /** Defaults to 0: no expiration date. **/
  expirationDate?: number;
  whitelistPolicy: Address;
}

export interface DeployCreateSuiteExtendedParams
  extends DeployCreateSuiteParams {
  debtLimit?: number;
}

export const defaultCreditManagerParams: DeployCreateSuiteParams = {
  name: "",
  maxEnabledTokens: 4,
  feeInterest: 20,
  feeLiquidation: 2,
  feeLiquidationPremium: 2.5,
  feeLiquidationExpired: 0.01,
  feeLiquidationPremiumExpired: 2,
  minDebt: 0,
  maxDebt: 0,
  minorVersion: 310,
  accountFactoryType: "DEFAULT",
  isExpired: false,
  expirationDate: 0,
  whitelistPolicy: "0x0000000000000000000000000000000000000000",
};
