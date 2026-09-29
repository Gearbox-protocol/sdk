import {
  type Abi,
  type Address,
  encodeAbiParameters,
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

export type MellowErc4626AdapterState = BaseAdapterState;

export type MellowErc4626Adapter311DeployParams = {
  type: "MELLOW_ERC4626_VAULT";
  version: 311 | 312;
  target: Address;
  stakedToken: Address;
};

export type MellowErc4626AdapterDeployParams =
  | {
      type: "MELLOW_ERC4626_VAULT";
      version: 310;
      target: Address;
    }
  | MellowErc4626Adapter311DeployParams;

export const mellowErc4626AdapterPlugin: AdapterPlugin = {
  deprecated: true,
  name: "Mellow ERC4626",
  description: "Adapter for Mellow ERC4626 Vault",
  getDefaultParams: () => ({
    type: "MELLOW_ERC4626_VAULT",
    version: 312,
    target: zeroAddress,
    stakedToken: zeroAddress,
  }),
  isEditable: true,
  getDeployState: (params: MellowErc4626AdapterDeployParams) => ({
    type: "MELLOW_ERC4626_VAULT",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: MellowErc4626AdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        args.params.version === 310
          ? [args.creditManager, args.params.target]
          : [args.creditManager, args.params.target, args.params.stakedToken],
      ),
    };
  },
  validateParams: async (
    args: ValidateAdapterParamsArgs<MellowErc4626AdapterDeployParams>,
  ): Promise<false | string> => {
    const validate = erc4626AdapterPlugin.validateParams;
    if (validate) {
      return await validate({
        ...args,
        params: {
          type: "ERC4626_VAULT",
          version: 312,
          target: args.params.target,
          gateway: zeroAddress,
        },
      });
    }
    return false;
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): MellowErc4626AdapterState => {
    return {
      type: "MELLOW_ERC4626_VAULT",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
    };
  },
};
