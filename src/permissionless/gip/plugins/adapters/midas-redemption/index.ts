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
  type MidasRedemptionVaultAdapterContract,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { addressSchema } from "../../../core/validation.js";
import type {
  AdapterPlugin,
  BaseAdapterState,
  ValidateAdapterParamsArgs,
} from "../logic.js";
import { validateCollateralTokens } from "../utils.js";

import type {
  MidasRedemptionTokenStatus,
  SetTokenAllowedStatusBatchAction,
} from "./set-token-allowed-status-batch-action.js";

export type MidasRedemptionAdapterState = BaseAdapterState & {
  allowedTokens: MidasRedemptionTokenStatus[];
};

export interface MidasRedemptionAdapterDeployParams {
  type: "MIDAS_REDEMPTION_VAULT";
  version: 310 | 311;
  target: Address;
}

export const midasRedemptionDeployParamsSchema = z.object({
  type: z.literal("MIDAS_REDEMPTION_VAULT"),
  version: z.literal(311),
  target: addressSchema,
});

export const midasRedemptionAdapterPlugin: AdapterPlugin = {
  name: "Midas Redemption",
  description: "Adapter for Midas Redemption",
  getDefaultParams: () => ({
    type: "MIDAS_REDEMPTION_VAULT",
    version: 311,
    target: zeroAddress,
  }),
  isEditable: false,
  getDeployState: (params: MidasRedemptionAdapterDeployParams) => ({
    type: "MIDAS_REDEMPTION_VAULT",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    allowedTokens: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: MidasRedemptionAdapterDeployParams;
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
    args: ValidateAdapterParamsArgs<MidasRedemptionAdapterDeployParams>,
  ): Promise<false | string> => {
    const { client, params } = args;
    const { target } = params;

    if (!isAddress(target)) return "Invalid midas redemption gateway address";
    try {
      const mToken = await client.readContract({
        address: target,
        abi: [
          {
            inputs: [],
            name: "mToken",
            outputs: [{ name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "mToken",
      });

      return validateCollateralTokens({
        ...args,
        tokens: [mToken],
      });
    } catch {
      return "Invalid midas redemption gateway";
    }
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): MidasRedemptionAdapterState => {
    const midasRedemptionAdapter =
      adapter as unknown as MidasRedemptionVaultAdapterContract;
    return {
      type: "MIDAS_REDEMPTION_VAULT",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      allowedTokens: midasRedemptionAdapter.allowedTokens.map(t => ({
        token: typeof t === "object" ? t.token : t,
        phantomToken: typeof t === "object" ? t.phantomToken : undefined,
        allowed: true,
      })),
    };
  },
};

export type MidasRedemptionMarketActions = SetTokenAllowedStatusBatchAction;

export const midasRedemptionMarketActionsSchema = z.discriminatedUnion(
  "version",
  [
    z.object({
      type: z.literal(
        "ADAPTER::MIDAS_REDEMPTION_VAULT::setTokenAllowedStatusBatch",
      ),
      creditManager: addressSchema,
      version: z.literal(310),
      target: addressSchema,
      allowedTokens: z.array(
        z.object({
          token: addressSchema,
          phantomToken: addressSchema,
          allowed: z.boolean(),
        }),
      ),
    }),
    z.object({
      type: z.literal(
        "ADAPTER::MIDAS_REDEMPTION_VAULT::setTokenAllowedStatusBatch",
      ),
      creditManager: addressSchema,
      version: z.literal(311),
      target: addressSchema,
      allowedTokens: z.array(
        z.object({
          token: addressSchema,
          allowed: z.boolean(),
        }),
      ),
    }),
  ],
);
