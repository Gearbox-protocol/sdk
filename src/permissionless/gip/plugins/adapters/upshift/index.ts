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
import { erc4626AdapterPlugin } from "../erc4626/index.js";
import type {
  AdapterPlugin,
  BaseAdapterState,
  ValidateAdapterParamsArgs,
} from "../logic.js";

export type UpshiftAdapterState = BaseAdapterState;

export interface UpshiftAdapterDeployParams {
  type: "UPSHIFT_VAULT";
  version: 310 | 311;
  target: Address;
  stakedToken: Address;
}

export const upshiftPlugin: AdapterPlugin = {
  name: "Upshift",
  description: "Adapter for Upshift Vault",
  getDefaultParams: () => ({
    type: "UPSHIFT_VAULT",
    version: 311,
    target: "0x7d55301c4071ef91A1dFF840327D4cB3530891a5",
    stakedToken: zeroAddress,
  }),
  isEditable: true,
  getDeployState: (params: UpshiftAdapterDeployParams) => ({
    type: "UPSHIFT_VAULT",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: UpshiftAdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        [args.creditManager, args.params.target, args.params.stakedToken],
      ),
    };
  },
  validateParams: async (
    args: ValidateAdapterParamsArgs<UpshiftAdapterDeployParams>,
  ): Promise<false | string> => {
    const { client, params } = args;
    const { target } = params;

    if (!isAddress(target)) return "Invalid vault address";
    try {
      const vault = await client.readContract({
        address: target as Address,
        abi: [
          {
            inputs: [],
            name: "upshiftVault",
            outputs: [{ name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "upshiftVault",
      });

      const validate = erc4626AdapterPlugin.validateParams;
      if (validate) {
        return await validate({
          ...args,
          params: {
            type: "ERC4626_VAULT",
            version: 312,
            target: vault,
            gateway: target,
          },
        });
      }
      return false;
    } catch {
      return "Invalid vault";
    }
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): UpshiftAdapterState => {
    return {
      type: "UPSHIFT_VAULT",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
    };
  },
};
