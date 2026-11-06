import type { Address } from "viem";
import type { CreditManagerFees } from "../../bindings/types.js";
import type { GipRegistry } from "../GipRegistry.js";
import type { InterestRateModelParams } from "../plugins/irm/irmPlugins.js";
import type { LossPolicyDeployParams } from "../plugins/loss-policies/lossPolicyPlugins.js";
import type { RateKeeperDeployParams } from "../plugins/rate-keepers/rateKeeperPlugins.js";
import type { GipBuilderContext } from "./builderContext.js";

export type BaseMarketAction<T extends string, P extends object> = {
  type: T;
  params: P;
};

/** What the steps of an action may depend on besides the state and params. **/
export interface ActionEnv {
  /**
   * Unix time (seconds) time-dependent fields are derived at, e.g. whether a
   * credit manager is expired. Defaults to the source block timestamp.
   **/
  timestamp: number;
  /** Exact amount conversion, supplied by the executor. **/
  tokens?: GipBuilderContext["tokens"];
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
  /** Creation cannot set expiration; use CREDIT::setExpirationDate. **/
  expirationDate?: never;
  whitelistPolicy: Address;
}
