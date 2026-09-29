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
import type { AdapterPlugin, BaseAdapterState } from "../logic.js";

import type { UpdateSupportedPidAction } from "./update-supported-pids-action.js";

export type ConvexV1BoosterAdapterState = BaseAdapterState;

export interface ConvexV1BoosterAdapterDeployParams {
  type: "CVX_V1_BOOSTER";
  version: 310;
  target: Address;
}

export const convexV1BoosterPlugin: AdapterPlugin = {
  name: "ConvexV1 Booster",
  description: "Adapter for Convex V1 Booster",
  getDefaultParams: () => ({
    type: "CVX_V1_BOOSTER",
    version: 310,
    target: "0xF403C135812408BFbE8713b5A23a04b3D48AAE31" as Address,
  }),
  isEditable: false,
  getDeployState: (params: ConvexV1BoosterAdapterDeployParams) => ({
    type: "CVX_V1_BOOSTER",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: ConvexV1BoosterAdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        [args.creditManager, args.params.target],
      ),
    };
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): ConvexV1BoosterAdapterState => {
    return {
      type: "CVX_V1_BOOSTER",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
    };
  },
};

export type ConvexV1BoosterMarketActions = UpdateSupportedPidAction;

export const convexV1BoosterMarketActionsSchema = z.object({
  type: z.literal("ADAPTER::CVX_V1_BOOSTER::updateSupportedPids"),
  version: z.literal(310),
  creditManager: addressSchema,
  target: addressSchema,
});
