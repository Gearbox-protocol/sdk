import {
  type Abi,
  type Address,
  encodeAbiParameters,
  stringToHex,
  zeroAddress,
} from "viem";
import { z } from "zod";
import {
  type AbstractAdapterContract,
  adapterConstructorAbi,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { addressSchema } from "../../../core/validation.js";
import { getCurveV1Plugin } from "../curve-v1/index.js";
import type {
  AdapterPlugin,
  BaseAdapterState,
  ValidateAdapterParamsArgs,
} from "../logic.js";

export type CurveV1StETHAdapterState = BaseAdapterState;

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

export const curveV1StETHPlugin: AdapterPlugin = {
  name: "CurveV1 StETH",
  description: "Adapter for CurveV1 StETH",
  getDefaultParams: () => ({
    type: "CURVE_V1_STECRV_POOL",
    version: 311,
    target: zeroAddress,
    lpToken: zeroAddress,
  }),
  isEditable: true,
  getDeployState: (params: CurveV1StETHAdapterDeployParams) => ({
    type: "CURVE_V1_STECRV_POOL",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: CurveV1StETHAdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        [args.creditManager, args.params.target, args.params.lpToken],
      ),
    };
  },
  validateParams: async (
    args: ValidateAdapterParamsArgs<CurveV1StETHAdapterDeployParams>,
  ): Promise<false | string> => {
    const validate = getCurveV1Plugin("CURVE_V1_2ASSETS").validateParams;
    if (validate) {
      return await validate({
        ...args,
        params: {
          type: "CURVE_V1_2ASSETS",
          version: 311,
          target: args.params.target,
          lpToken: args.params.lpToken,
          basePool: zeroAddress,
          use256: false,
        },
      });
    }
    return false;
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): CurveV1StETHAdapterState => {
    return {
      type: "CURVE_V1_STECRV_POOL",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
    };
  },
};
