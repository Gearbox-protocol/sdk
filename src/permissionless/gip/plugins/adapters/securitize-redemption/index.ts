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

export type SecuritizeRedemptionAdapterState = BaseAdapterState;

export type SecuritizeRedemptionAdapterDeployParams = {
  type: "SECURITIZE_REDEMPTION";
  version: 310 | 311;
  target: Address;
  phantomToken: Address;
};

export const securitizeRedemptionDeployParamsSchema = z.object({
  type: z.literal("SECURITIZE_REDEMPTION"),
  version: z.literal(311),
  target: addressSchema,
  phantomToken: addressSchema,
});

export const securitizeRedemptionAdapterPlugin: AdapterPlugin = {
  name: "Securitize Redemption",
  description: "Adapter for Securitize Redemption",
  getDefaultParams: () => ({
    type: "SECURITIZE_REDEMPTION",
    version: 311,
    target: zeroAddress,
    phantomToken: zeroAddress,
  }),
  isEditable: true,
  getDeployState: (params: SecuritizeRedemptionAdapterDeployParams) => ({
    type: "SECURITIZE_REDEMPTION",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: SecuritizeRedemptionAdapterDeployParams;
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
  validateParams: async (
    args: ValidateAdapterParamsArgs<SecuritizeRedemptionAdapterDeployParams>,
  ): Promise<false | string> => {
    const { client, params } = args;
    const { target, phantomToken } = params;

    if (!isAddress(target)) return "Invalid target address";

    try {
      const [dsToken, stableCoinToken, redemptionGateway] =
        await client.multicall({
          allowFailure: false,
          contracts: [
            {
              address: target,
              abi: [
                {
                  inputs: [],
                  name: "dsToken",
                  outputs: [{ name: "", type: "address" }],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              functionName: "dsToken",
            },
            {
              address: target,
              abi: [
                {
                  inputs: [],
                  name: "stableCoinToken",
                  outputs: [{ name: "", type: "address" }],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              functionName: "stableCoinToken",
            },
            {
              address: phantomToken,
              abi: [
                {
                  inputs: [],
                  name: "redemptionGateway",
                  outputs: [{ name: "", type: "address" }],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              functionName: "redemptionGateway",
            },
          ],
        });

      if (redemptionGateway.toLowerCase() !== phantomToken.toLowerCase())
        return "Invalid redemption gateway";

      return validateCollateralTokens({
        ...args,
        tokens: [dsToken, stableCoinToken],
      });
    } catch {
      return "Invalid target";
    }
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): SecuritizeRedemptionAdapterState => {
    return {
      type: "SECURITIZE_REDEMPTION",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
    };
  },
};
