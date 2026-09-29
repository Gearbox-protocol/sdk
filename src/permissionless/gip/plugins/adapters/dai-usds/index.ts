import {
  type Abi,
  type Address,
  encodeAbiParameters,
  isAddress,
  stringToHex,
  zeroAddress,
} from "viem";
import {
  type AbstractAdapterContract,
  adapterConstructorAbi,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import type {
  AdapterPlugin,
  BaseAdapterState,
  ValidateAdapterParamsArgs,
} from "../logic.js";
import { validateCollateralTokens } from "../utils.js";

export type DaiUsdsAdapterState = BaseAdapterState;

export interface DaiUsdsAdapterDeployParams {
  type: "DAI_USDS_EXCHANGE";
  version: 310;
  target: Address;
}

export const daiUsdsAdapterPlugin: AdapterPlugin = {
  name: "DAI USDS Exchange",
  description: "Adapter for SKY Dai/USDS Exchange",
  getDefaultParams: () => ({
    type: "DAI_USDS_EXCHANGE",
    version: 310,
    target: "0x3225737a9Bbb6473CB4a45b7244ACa2BeFdB276A" as Address,
  }),
  isEditable: false,
  getDeployState: (params: DaiUsdsAdapterDeployParams) => ({
    type: "DAI_USDS_EXCHANGE",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: DaiUsdsAdapterDeployParams;
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
    args: ValidateAdapterParamsArgs<DaiUsdsAdapterDeployParams>,
  ): Promise<false | string> => {
    const { client, params } = args;
    const { target } = params;

    if (!isAddress(target)) return "Invalid target address";
    try {
      const tokens = await client.multicall({
        allowFailure: false,
        contracts: [
          {
            address: target,
            abi: [
              {
                inputs: [],
                name: "dai",
                outputs: [{ name: "", type: "address" }],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "dai",
            args: [],
          },
          {
            address: target,
            abi: [
              {
                inputs: [],
                name: "usds",
                outputs: [{ name: "", type: "address" }],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "usds",
            args: [],
          },
        ],
      });

      return validateCollateralTokens({
        ...args,
        tokens,
      });
    } catch {
      return "Invalid target";
    }
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): DaiUsdsAdapterState => {
    return {
      type: "DAI_USDS_EXCHANGE",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
    };
  },
};
