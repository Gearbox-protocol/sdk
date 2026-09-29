import type { Address } from "viem";
import type { z } from "zod";
import {
  DEFAULT_INTEREST_RATE_MODEL_PARAMS,
  type InterestRateModelParams,
} from "../../plugins/irm/logic.js";
import {
  DEFAULT_LOSS_POLICY_PARAMS,
  type LossPolicyDeployParams,
} from "../../plugins/loss-policies/logic.js";
import {
  DEFAULT_RATE_KEEPER_PARAMS,
  type RateKeeperDeployParams,
} from "../../plugins/rate-keepers/logic.js";
import type { CreditManagerFees, MarketState } from "../market-state/types.js";
import type { MarketTx } from "../market-tx.js";
import type { GipBuilderContext } from "./context.js";
import type { CreateMarketAction } from "./market-create-market.js";

export type MarketActions = CreateMarketAction;

export type BaseMarketAction<T extends string, P extends object> = {
  type: T;
  params: P;
};

export interface MarketActionData<
  A extends BaseMarketAction<string, object>,
  C = object,
> {
  type: A["type"];
  name?: string;
  schema: z.ZodSchema;
  description: string;
  stateTransition: (params: {
    state: MarketState;
    params: A["params"];
    newContract?: Address;
  }) => MarketState;
  getRawTx: (params: {
    ctx: GipBuilderContext;
    state: MarketState;
    action: A;
  }) => Promise<{ tx: MarketTx }>;
  replace: (a: A["params"], b: A["params"]) => boolean;
  replaceKeep?: "first" | "last";
  replaceCmAddress?: (params: {
    action: A;
    newCm: Address;
    oldCm: Address;
  }) => A;
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
  name: string;
  salt?: string;
  maxEnabledTokens: number;
  feeInterest: number;
  minDebt: number;
  maxDebt: number;
  minorVersion: 310; // | 320;
  accountFactoryType: AccountFactoryType;
  isExpired: boolean;
  expirationDate: number;
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
