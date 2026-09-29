import {
  type Abi,
  type Address,
  encodeAbiParameters,
  isAddress,
  stringToHex,
  zeroAddress,
} from "viem";
import { z } from "zod";
import { iVersionAbi } from "../../../../../abi/iVersion.js";
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

export type MidasGatewayAdapterState = BaseAdapterState;

export interface MidasGatewayAdapterDeployParams {
  type: "MIDAS_GATEWAY";
  version: 311;
  target: Address;
}

export const midasGatewayDeployParamsSchema = z.object({
  type: z.literal("MIDAS_GATEWAY"),
  version: z.literal(311),
  target: addressSchema,
});

export const midasGatewayAdapterPlugin: AdapterPlugin = {
  name: "Midas Gateway",
  description: "Adapter for Midas Gateway",
  getDefaultParams: () => ({
    type: "MIDAS_GATEWAY",
    version: 311,
    target: zeroAddress,
  }),
  isEditable: false,
  getDeployState: (params: MidasGatewayAdapterDeployParams) => ({
    type: "MIDAS_GATEWAY",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: MidasGatewayAdapterDeployParams;
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
    args: ValidateAdapterParamsArgs<MidasGatewayAdapterDeployParams>,
  ): Promise<false | string> => {
    const { client, params, marketConfigurator } = args;
    const { target } = params;

    if (!isAddress(target)) return "Invalid midas gateway address";

    const cmState =
      args.marketChanges.after.creditManagers[
        args.creditManager.toLowerCase() as Address
      ];
    if (!cmState) return "Credit manager not found";

    if (cmState.degenNFT !== zeroAddress) {
      try {
        const cType = await client.readContract({
          address: target,
          abi: iVersionAbi,
          functionName: "contractType",
        });

        // skip gateway check if credit suite does not use midas degen nft
        if (
          cType.toLowerCase() ===
          stringToHex("DEGEN_NFT::MIDAS", { size: 32 }).toLowerCase()
        ) {
          try {
            const gateway = await client.readContract({
              address: target,
              abi: [
                {
                  inputs: [],
                  name: "gateway",
                  outputs: [{ name: "", type: "address" }],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              functionName: "gateway",
            });

            if (gateway.toLowerCase() !== target.toLowerCase()) {
              return "Whitelist policy (Degen NFT) was set for different gateway";
            }
          } catch {
            return "Invalid whitelist policy (Degen NFT)";
          }
        }
      } catch {
        // skip gateway check if credit suite uses unknown whitelist policy
      }
    }

    try {
      const [mToken, quoteToken, phantomToken, allowedMarketConfigurator] =
        await client.multicall({
          contracts: [
            {
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
            },
            {
              address: target,
              abi: [
                {
                  inputs: [],
                  name: "quoteToken",
                  outputs: [{ name: "", type: "address" }],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              functionName: "quoteToken",
            },
            {
              address: target,
              abi: [
                {
                  inputs: [],
                  name: "phantomToken",
                  outputs: [{ name: "", type: "address" }],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              functionName: "phantomToken",
            },
            {
              address: target,
              abi: [
                {
                  inputs: [],
                  name: "allowedMarketConfigurator",
                  outputs: [{ name: "", type: "address" }],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              functionName: "allowedMarketConfigurator",
            },
          ],
          allowFailure: false,
        });

      if (
        allowedMarketConfigurator.toLowerCase() !==
        marketConfigurator.toLowerCase()
      ) {
        return "Gateway is not allowed for this market";
      }

      return validateCollateralTokens({
        ...args,
        tokens: [mToken, quoteToken].concat(
          phantomToken !== zeroAddress ? [phantomToken] : [],
        ),
      });
    } catch {
      return "Invalid midas gateway";
    }
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): MidasGatewayAdapterState => {
    return {
      type: "MIDAS_GATEWAY",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
    };
  },
};
