import { type Address, zeroAddress } from "viem";
import { z } from "zod/v4";
import { addressSchema } from "../../../validationSchemas.js";
import { adapterDeployParams, plainAdapter } from "../adapterPluginHelpers.js";
import { validateCurveTarget } from "../curve-v1/getCurveV1Plugin.js";
import type {
  AdapterStateBase,
  ValidateAdapterParamsArgs,
} from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";

export type CurveV1StETHAdapterState = AdapterStateBase;

export interface CurveV1StETHAdapterDeployParams {
  type: "CURVE_V1_STECRV_POOL";
  version: 310 | 311;
  target: Address;
  lpToken: Address;
}

export const curveV1StETHDeployParamsSchema = z.object({
  type: z.literal("CURVE_V1_STECRV_POOL"),
  version: z.literal(311),
  target: addressSchema,
  lpToken: addressSchema,
});

export const curveV1StETHPlugin = defineAdapterPlugin<
  CurveV1StETHAdapterDeployParams,
  CurveV1StETHAdapterState
>()({
  type: "CURVE_V1_STECRV_POOL",
  name: "CurveV1 StETH",
  description: "Adapter for CurveV1 StETH",
  getDefaultParams: () => ({
    type: "CURVE_V1_STECRV_POOL",
    version: 311,
    target: zeroAddress,
    lpToken: zeroAddress,
  }),
  isEditable: true,
  allowGas: 2_000_000, // not measured
  ...plainAdapter("CURVE_V1_STECRV_POOL"),
  getDeployParams: (args: {
    creditManager: Address;
    params: CurveV1StETHAdapterDeployParams;
  }) => adapterDeployParams(args, [args.params.lpToken]),
  // The stETH pool is a regular two-coin Curve pool.
  validateParams: (
    args: ValidateAdapterParamsArgs<CurveV1StETHAdapterDeployParams>,
  ) =>
    validateCurveTarget({
      ...args,
      params: { type: "CURVE_V1_2ASSETS", target: args.params.target },
    }),
  deployParamsSchema: curveV1StETHDeployParamsSchema,
  actions: {},
});
