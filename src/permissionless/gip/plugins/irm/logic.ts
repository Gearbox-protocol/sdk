import type { DeployParams } from "../../core/market-tx.js";
import type { Plugin } from "../logic.js";
import {
  type LinearInterestRateModelParams,
  type LinearInterestRateModelState,
  linearInterestRateModelDeployParamsSchema,
  linearPlugin,
} from "./linear/logic.js";
export type InterestRateModelParams = LinearInterestRateModelParams;

export type InterestRateModelState = LinearInterestRateModelState;

export type InterestRateModelType = InterestRateModelParams["type"];

export const DEFAULT_INTEREST_RATE_MODEL_PARAMS: InterestRateModelParams = {
  type: "LINEAR",
  params: {
    U_1: 70,
    U_2: 90,
    R_base: 0,
    R_slope1: 5,
    R_slope2: 20,
    R_slope3: 100,
    isBorrowingMoreU2Forbidden: true,
  },
};

export const DEFAULT_INTEREST_RATE_MODEL_STATE: InterestRateModelState = {
  ...DEFAULT_INTEREST_RATE_MODEL_PARAMS,
};

export interface IRMPlugin
  extends Plugin<InterestRateModelParams, InterestRateModelState, object> {
  getDeployParams(params: InterestRateModelParams): DeployParams;
}

export const irmPlugins: Record<InterestRateModelType, IRMPlugin> = {
  LINEAR: linearPlugin,
};

export const irmDeployParamsSchema = linearInterestRateModelDeployParamsSchema;
