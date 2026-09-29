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
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { addressSchema } from "../../../core/validation.js";
import type {
  AdapterPlugin,
  BaseAdapterState,
  ValidateAdapterParamsArgs,
} from "../logic.js";
import { validateCollateralTokens } from "../utils.js";

export type Erc4626AdapterState = BaseAdapterState;

export type Erc4626Adapter312DeployParams = {
  type: "ERC4626_VAULT";
  version: 312;
  target: Address;
  gateway: Address;
};

export type Erc4626AdapterDeployParams =
  | {
      type: "ERC4626_VAULT";
      version: 310 | 311;
      target: Address;
    }
  | Erc4626Adapter312DeployParams;

export const erc4626DeployParamsSchema = z.object({
  type: z.literal("ERC4626_VAULT"),
  version: z.literal(311),
  target: addressSchema,
  gateway: addressSchema,
});

export const erc4626AdapterPlugin: AdapterPlugin = {
  name: "ERC4626",
  description: "Adapter for ERC4626 Vault",
  getDefaultParams: () => ({
    type: "ERC4626_VAULT",
    version: 312,
    target: zeroAddress,
    gateway: zeroAddress,
  }),
  isEditable: true,
  getDeployState: (params: Erc4626AdapterDeployParams) => ({
    type: "ERC4626_VAULT",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: Erc4626AdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        args.params.version === 312
          ? [args.creditManager, args.params.target, args.params.gateway]
          : [args.creditManager, args.params.target],
      ),
    };
  },
  validateParams: async (
    args: ValidateAdapterParamsArgs<Erc4626AdapterDeployParams>,
  ): Promise<false | string> => {
    const { client, params } = args;
    const { target } = params;

    if (!isAddress(target)) return "Invalid target address";

    try {
      const asset = await client.readContract({
        address: target,
        abi: [
          {
            inputs: [],
            name: "asset",
            outputs: [{ name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "asset",
      });

      return validateCollateralTokens({
        ...args,
        tokens: [asset],
      });
    } catch {
      return "Invalid target";
    }
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): Erc4626AdapterState => {
    return {
      type: "ERC4626_VAULT",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
    };
  },
};
