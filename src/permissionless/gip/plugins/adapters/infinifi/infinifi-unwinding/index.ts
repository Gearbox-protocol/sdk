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
  type InfinifiUnwindingGatewayAdapterContract,
} from "../../../../../../onchain/index.js";
import type { DeployParams } from "../../../../core/market-tx.js";
import { addressSchema } from "../../../../core/validation.js";
import type { AdapterPlugin } from "../../logic.js";
import type { InfinifiAdapterState } from "../index.js";

import type { UnwindingSetLockedTokenBatchStatusAction } from "../set-pool-key-status-batch-action.js";

export interface InfinifiUnwindingAdapterDeployParams {
  type: "INFINIFI_UNWINDING";
  version: 310;
  target: Address;
  phantomToken: Address;
}

export const infinifiUnwindingDeployParamsSchema = z.object({
  type: z.literal("INFINIFI_UNWINDING"),
  version: z.literal(310),
  target: addressSchema,
  phantomToken: addressSchema,
});

export const infinifiUnwindingPlugin: AdapterPlugin = {
  name: "Infinifi Unwinding",
  description: "Adapter for Infinifi Unwinding",
  getDefaultParams: () => ({
    type: "INFINIFI_UNWINDING",
    version: 310,
    target: zeroAddress,
    phantomToken: zeroAddress,
  }),
  isEditable: true,
  getDeployState: (params: InfinifiUnwindingAdapterDeployParams) => ({
    type: "INFINIFI_UNWINDING",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    lockedTokens: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: InfinifiUnwindingAdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        [args.creditManager, args.params.target, args.params.phantomToken],
      ),
    };
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): InfinifiAdapterState => {
    const infinifiAdapter =
      adapter as unknown as InfinifiUnwindingGatewayAdapterContract;
    return {
      type: "INFINIFI_UNWINDING",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      lockedTokens: infinifiAdapter.allowedLockedTokens.map(lockedToken => ({
        lockedToken,
        unwindingEpochs: 0, // TODO: get unwinding epochs from infinifi unwinding gateway contract
        allowed: true,
      })),
    };
  },
};

export type InfinifiUnwindingMarketActions =
  UnwindingSetLockedTokenBatchStatusAction;

export const infinifiUnwindingMarketActionsSchema = z.object({
  type: z.literal("ADAPTER::INFINIFI_UNWINDING::setLockedTokenBatchStatus"),
  creditManager: addressSchema,
  version: z.literal(310),
  target: addressSchema,
  params: z.array(
    z.object({
      lockedToken: addressSchema,
      unwindingEpochs: z.number(),
      allowed: z.boolean(),
    }),
  ),
});
