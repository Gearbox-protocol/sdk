import type { Address } from "viem";
import { z } from "zod";
import type { MarketState } from "../../core/market-state/types.js";
import type { DeployParams } from "../../core/market-tx.js";
import type { Plugin } from "../logic.js";
import {
  type AliasLossPolicyParams as AliasLossPolicyDeployParams,
  type AliasLossPolicyState,
  type AliasMarketActions,
  aliasDeployParamsSchema,
  aliasMarketActionsData,
  aliasPlugin,
} from "./alias/logic.js";

export type LossPolicyDeployParams = AliasLossPolicyDeployParams;

export type AbstractLossPolicyState = {
  enabled: boolean;
};

export type LossPolicyState = AliasLossPolicyState;

export type LossPolicyType = LossPolicyDeployParams["type"];

export interface LossPolicyPlugin
  extends Plugin<LossPolicyDeployParams, LossPolicyState, {}> {
  getDeployParams(args: {
    pool: Address;
    addressProvider: Address;
    params: LossPolicyDeployParams;
  }): DeployParams;
}

export const lossPolicyPlugins: Record<LossPolicyType, LossPolicyPlugin> = {
  ALIAS: aliasPlugin,
};

const DEFAULT_LOSS_POLICY_TYPE: LossPolicyType = "ALIAS";

export const DEFAULT_LOSS_POLICY_PARAMS: LossPolicyDeployParams =
  lossPolicyPlugins[DEFAULT_LOSS_POLICY_TYPE].getDefaultParams();

export const DEFAULT_LOSS_POLICY_STATE: LossPolicyState = lossPolicyPlugins[
  DEFAULT_LOSS_POLICY_PARAMS.type
].getDeployState(DEFAULT_LOSS_POLICY_PARAMS);

export type LossPolicyMarketActions = AliasMarketActions;

export const lossPolicyDeployParamsSchema = z.discriminatedUnion("type", [
  aliasDeployParamsSchema,
]);

export const lossPolicyMarketActionsSchemas = [
  z.object({
    type: z.literal("updateLossPolicy"),
    params: lossPolicyDeployParamsSchema,
  }),
  z.object({
    type: z.literal("enableLossPolicy"),
  }),
  z.object({
    type: z.literal("disableLossPolicy"),
  }),
];

export const lossPolicyMarketActionsData = [...aliasMarketActionsData];

export function updateLossPolicyState<T extends LossPolicyState>(args: {
  state: MarketState;
  update: (state: T) => T;
}): MarketState {
  const { state, update } = args;

  if (!state.lossPolicy) {
    throw new Error("Loss policy not configured");
  }

  return {
    ...state,
    lossPolicy: update(state.lossPolicy as T),
  };
}
