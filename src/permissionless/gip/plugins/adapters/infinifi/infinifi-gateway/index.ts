import {
  type Abi,
  type Address,
  encodeAbiParameters,
  isAddress,
  stringToHex,
  zeroAddress,
} from "viem";
import { z } from "zod";
import {
  type AbstractAdapterContract,
  adapterConstructorAbi,
  type InfinifiGatewayAdapterContract,
} from "../../../../../../onchain/index.js";
import type { DeployParams } from "../../../../core/market-tx.js";
import { addressSchema } from "../../../../core/validation.js";
import type { AdapterPlugin, ValidateAdapterParamsArgs } from "../../logic.js";
import { validateCollateralTokens } from "../../utils.js";
import type { InfinifiAdapterState } from "../index.js";

import type { GatewaySetLockedTokenBatchStatusAction } from "../set-pool-key-status-batch-action.js";

export interface InfinifiGatewayAdapterDeployParams {
  type: "INFINIFI_GATEWAY";
  version: 310;
  target: Address;
}

const infinifiGatewayAbi = [
  {
    inputs: [{ name: "name", type: "string" }],
    name: "getAddress",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const infinifiGatewayPlugin: AdapterPlugin = {
  name: "Infinifi Gateway",
  description: "Adapter for Infinifi Gateway",
  getDefaultParams: () => ({
    type: "INFINIFI_GATEWAY",
    version: 310,
    target: zeroAddress,
  }),
  isEditable: false,
  getDeployState: (params: InfinifiGatewayAdapterDeployParams) => ({
    type: "INFINIFI_GATEWAY",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    lockedTokens: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: InfinifiGatewayAdapterDeployParams;
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
  validateParams: async (
    args: ValidateAdapterParamsArgs<InfinifiGatewayAdapterDeployParams>,
  ): Promise<false | string> => {
    const { client, params } = args;
    const { target } = params;

    if (!isAddress(target)) return "Invalid vault address";

    try {
      const tokens = await client.multicall({
        allowFailure: false,
        contracts: [
          {
            address: target,
            abi: infinifiGatewayAbi,
            functionName: "getAddress",
            args: ["USDC"],
          },
          {
            address: target,
            abi: infinifiGatewayAbi,
            functionName: "getAddress",
            args: ["receiptToken"],
          },
          {
            address: target,
            abi: infinifiGatewayAbi,
            functionName: "getAddress",
            args: ["stakedToken"],
          },
        ],
      });

      return validateCollateralTokens({
        ...args,
        tokens,
      });
    } catch {
      return "Invalid vault";
    }
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): InfinifiAdapterState => {
    const infinifiAdapter =
      adapter as unknown as InfinifiGatewayAdapterContract;
    return {
      type: "INFINIFI_GATEWAY",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      lockedTokens: infinifiAdapter.allowedLockedTokens.map(lockedToken => ({
        lockedToken,
        unwindingEpochs: 0, // TODO: get unwinding epochs from infinifi gateway contract
        allowed: true,
      })),
    };
  },
};

export type InfinifiGatewayMarketActions =
  GatewaySetLockedTokenBatchStatusAction;

export const infinifiGatewayMarketActionsSchema = z.object({
  type: z.literal("ADAPTER::INFINIFI_GATEWAY::setLockedTokenBatchStatus"),
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
