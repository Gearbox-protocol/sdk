import type { Address } from "viem";
import { z } from "zod/v4";
import type { DeployParams } from "../../types.js";
import type { Plugin } from "../Plugin.js";
import { aliasMarketActionsData } from "./alias/actions/aliasMarketActionsData.js";
import {
  type AliasLossPolicyParams as AliasLossPolicyDeployParams,
  type AliasLossPolicyState,
  aliasDeployParamsSchema,
  aliasPlugin,
} from "./alias/aliasPlugin.js";

export type LossPolicyDeployParams = AliasLossPolicyDeployParams;

export type AbstractLossPolicyState = {
  enabled: boolean;
};

export type LossPolicyState = AliasLossPolicyState;

export type LossPolicyType = LossPolicyDeployParams["type"];

export interface LossPolicyPlugin
  extends Plugin<LossPolicyDeployParams, LossPolicyState> {
  getDeployParams(args: {
    pool: Address;
    addressProvider: Address;
    params: LossPolicyDeployParams;
  }): DeployParams;
}

export const lossPolicyPlugins: Record<LossPolicyType, LossPolicyPlugin> = {
  ALIAS: aliasPlugin,
};

export const DEFAULT_LOSS_POLICY_PARAMS: LossPolicyDeployParams =
  aliasPlugin.getDefaultParams();

export const lossPolicyDeployParamsSchema = z.discriminatedUnion("type", [
  aliasDeployParamsSchema,
]);
export const lossPolicyMarketActionsData = [...aliasMarketActionsData];
