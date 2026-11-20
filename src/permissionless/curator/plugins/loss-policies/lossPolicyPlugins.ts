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
import {
  type MidasAliasLossPolicyParams as MidasAliasLossPolicyDeployParams,
  type MidasAliasLossPolicyState,
  midasAliasDeployParamsSchema,
  midasAliasPlugin,
} from "./midas-alias/midasAliasPlugin.js";

export type LossPolicyDeployParams =
  | AliasLossPolicyDeployParams
  | MidasAliasLossPolicyDeployParams;

export type AbstractLossPolicyState = {
  enabled: boolean;
};

export type LossPolicyState = AliasLossPolicyState | MidasAliasLossPolicyState;

export type LossPolicyType = LossPolicyDeployParams["type"];

export interface LossPolicyPlugin
  extends Plugin<LossPolicyDeployParams, LossPolicyState> {
  /** Gas of deploying the policy with `MARKET::updateLossPolicy`. **/
  deployGas: number;
  getDeployParams(args: {
    pool: Address;
    addressProvider: Address;
    params: LossPolicyDeployParams;
  }): DeployParams;
}

export const lossPolicyPlugins: Record<LossPolicyType, LossPolicyPlugin> = {
  ALIAS: aliasPlugin,
  MIDAS_ALIAS: midasAliasPlugin,
};

export const DEFAULT_LOSS_POLICY_PARAMS: LossPolicyDeployParams =
  aliasPlugin.getDefaultParams();

export const lossPolicyDeployParamsSchema = z.discriminatedUnion("type", [
  aliasDeployParamsSchema,
  midasAliasDeployParamsSchema,
]);
export const lossPolicyMarketActionsData = [...aliasMarketActionsData];
