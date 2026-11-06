import type { DeployParams } from "../../types.js";
import type { Plugin } from "../Plugin.js";
import {
  type LinearInterestRateModelParams,
  type LinearInterestRateModelState,
  linearInterestRateModelDeployParamsSchema,
  linearPlugin,
} from "./linear/linearPlugin.js";

export type InterestRateModelParams = LinearInterestRateModelParams;

export type InterestRateModelState = LinearInterestRateModelState;

export type InterestRateModelType = InterestRateModelParams["type"];

export const DEFAULT_INTEREST_RATE_MODEL_PARAMS: InterestRateModelParams =
  linearPlugin.getDefaultParams();

export interface IRMPlugin
  extends Plugin<InterestRateModelParams, InterestRateModelState> {
  getDeployParams(params: InterestRateModelParams): DeployParams;
}

export const irmPlugins: Record<InterestRateModelType, IRMPlugin> = {
  LINEAR: linearPlugin,
};

export const irmDeployParamsSchema = linearInterestRateModelDeployParamsSchema;
