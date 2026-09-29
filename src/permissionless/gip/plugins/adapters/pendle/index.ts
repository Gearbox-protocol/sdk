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
  PendlePairStatus as PendlePairStatusEnum,
  type PendleRouterAdapterContract,
  PendleTokenType,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { addressSchema, literalsSchema } from "../../../core/validation.js";
import type { AdapterPlugin, BaseAdapterState } from "../logic.js";

import type {
  PendlePairStatus,
  SetPairBatchStatusAction,
} from "./set-pair-batch-status-action.js";

export type PendleAdapterState = BaseAdapterState & {
  pairs: PendlePairStatus[];
};

export interface PendleAdapterDeployParams {
  type: "PENDLE_ROUTER";
  version: 310 | 311;
  target: Address;
}

export const pendlePlugin: AdapterPlugin = {
  name: "Pendle",
  description: "Adapter for Pendle and its forks",
  getDefaultParams: () => ({
    type: "PENDLE_ROUTER",
    version: 311,
    target: "0x888888888889758F76e7103c6CbF23ABbF58F946" as Address,
  }),
  isEditable: false,
  getDeployState: (params: PendleAdapterDeployParams) => ({
    type: "PENDLE_ROUTER",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    pairs: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: PendleAdapterDeployParams;
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
  ): PendleAdapterState => {
    const pendleAdapter = adapter as unknown as PendleRouterAdapterContract;
    return {
      type: "PENDLE_ROUTER",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      pairs: pendleAdapter.allowedPairs.map(pair => ({
        market: pair.market,
        inputToken: pair.inputToken,
        pendleToken: pair.pendleToken,
        pendleTokenType:
          adapter.version > 310 && "pendleTokenType" in pair
            ? (pair.pendleTokenType ?? PendleTokenType.PT)
            : PendleTokenType.PT,
        status: pair.status,
      })),
    };
  },
};

export type PendleMarketActions = SetPairBatchStatusAction;

export const pendleMarketActionsSchema = z.object({
  type: z.literal("ADAPTER::PENDLE_ROUTER::setPairStatusBatch"),
  creditManager: addressSchema,
  version: literalsSchema(310, 311),
  target: addressSchema,
  params: z.array(
    z.object({
      market: addressSchema,
      inputToken: addressSchema,
      pendleToken: addressSchema,
      pendleTokenType: z.nativeEnum(PendleTokenType),
      status: z.nativeEnum(PendlePairStatusEnum),
    }),
  ),
});
